import torch, torch.nn as nn, torch.nn.functional as F

class MemoryModule(nn.Module):
    def __init__(self, num_slots=2000, latent_dim=256, shrink_thres=0.0025):
        super().__init__()
        self.num_slots = num_slots
        self.latent_dim = latent_dim
        self.shrink_thres = shrink_thres
        self.memory = nn.Parameter(torch.randn(num_slots, latent_dim))
    
    def forward(self, z):
        z_norm = F.normalize(z, dim=1)
        m_norm = F.normalize(self.memory, dim=1)
        sim = torch.matmul(z_norm, m_norm.T) 
        w = F.softmax(sim, dim=1)
        w_hat = F.relu(w - self.shrink_thres) * w / (torch.abs(w - self.shrink_thres) + 1e-12)
        w_hat = F.normalize(w_hat, p=1, dim=1)
        z_hat = torch.matmul(w_hat, self.memory)
        return z_hat

class ConvAE(nn.Module):
    """Convolutional / Variational Autoencoder built from scratch (no pretrained weights).

    227x227x1  ->  5 strided conv blocks (114, 57, 29, 15, 8)  ->  Linear  ->  1-D latent (latent_dim)
    latent      ->  Linear -> 5 transposed-conv blocks (8 -> 256) -> resize to 227 -> conv -> sigmoid
    """

    def __init__(self, latent_dim=256, variational=False, base=32, img_size=227, mem_slots=2000):
        super().__init__()
        self.latent_dim = latent_dim
        self.variational = variational
        self.img_size = img_size
        ch = [1, base, base * 2, base * 4, base * 8, base * 8]

        enc = []
        for i in range(5):
            enc += [nn.Conv2d(ch[i], ch[i + 1], kernel_size=3, stride=2, padding=1),
                    nn.BatchNorm2d(ch[i + 1]),
                    nn.LeakyReLU(0.2, inplace=True)]
        self.encoder = nn.Sequential(*enc)

        self.feat_ch = ch[5]
        flat = self.feat_ch * 8 * 8
        self.fc_mu = nn.Linear(flat, latent_dim)
        self.fc_logvar = nn.Linear(flat, latent_dim) if variational else None
        self.fc_dec = nn.Linear(latent_dim, flat)

        dec_ch = [ch[5], ch[4], ch[3], ch[2], ch[1], ch[1]]
        dec = []
        for i in range(5):
            dec += [nn.ConvTranspose2d(dec_ch[i], dec_ch[i + 1], kernel_size=4, stride=2, padding=1),
                    nn.BatchNorm2d(dec_ch[i + 1]),
                    nn.LeakyReLU(0.2, inplace=True)]
        self.decoder = nn.Sequential(*dec)
        self.out_conv = nn.Conv2d(ch[1], 1, kernel_size=3, stride=1, padding=1)
        
        self.has_memory = (mem_slots > 0)
        if self.has_memory:
            self.memory = MemoryModule(num_slots=mem_slots, latent_dim=latent_dim, shrink_thres=1.0/mem_slots)

    def encode(self, x):
        h = self.encoder(x).flatten(1)
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h) if self.variational else None
        return mu, logvar

    def decode(self, z):
        h = self.fc_dec(z).view(-1, self.feat_ch, 8, 8)
        h = self.decoder(h)
        h = F.interpolate(h, size=(self.img_size, self.img_size), mode="bilinear", align_corners=False)
        return torch.sigmoid(self.out_conv(h))

    def forward(self, x):
        mu, logvar = self.encode(x)
        if self.variational and self.training:
            z = mu + torch.randn_like(mu) * torch.exp(0.5 * logvar)
        else:
            z = mu
            
        if self.has_memory:
            z_hat = self.memory(z)
            recon = self.decode(z_hat)
        else:
            recon = self.decode(z)
            
        return recon, mu, logvar
