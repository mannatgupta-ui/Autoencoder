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


import os, io, json, base64, zipfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
import torch, torch.nn as nn, torch.nn.functional as F
import joblib
from sklearn.ensemble import IsolationForest

IMG = 227

IMG = 227
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp", ".gif"}


# ----------------------------------------------------------------------------
# 1. FOLDER INGESTION  (any folder, any number of images, nested folders OK)
# ----------------------------------------------------------------------------
def collect_image_paths(folder):
    """Recursively find every image file under `folder` (sorted, hidden files skipped)."""
    folder = Path(folder)
    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder}")
    paths = []
    for p in sorted(folder.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix.lower() not in IMAGE_EXTS:
            continue
        if any(part.startswith(".") or part == "__MACOSX" for part in p.parts):
            continue
        paths.append(p)
    return paths


def extract_zip_into(zip_source, dest):
    """Safely extract a .zip (path or bytes) into `dest`. Blocks path traversal."""
    dest = Path(dest)
    dest.mkdir(parents=True, exist_ok=True)
    if isinstance(zip_source, (bytes, bytearray, memoryview)):
        zip_source = io.BytesIO(bytes(zip_source))
    with zipfile.ZipFile(zip_source) as zf:
        for member in zf.infolist():
            target = (dest / member.filename).resolve()
            if not str(target).startswith(str(dest.resolve())):
                continue  # path traversal attempt -> skip
            zf.extract(member, dest)
    return dest


def load_rgb(path):
    """Open any image as 8-bit RGB (EXIF-rotated). Returns None if unreadable."""
    try:
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode in ("I;16", "I", "F"):
                arr = np.asarray(im, dtype=np.float32)
                arr = (255.0 * (arr - arr.min()) / max(arr.max() - arr.min(), 1e-6)).astype(np.uint8)
                im = Image.fromarray(arr)
            return im.convert("RGB")
    except Exception:
        return None


def to_gray227(rgb):
    """Same preprocessing as training: grayscale, 227x227, float32 in [0, 1]."""
    g = rgb.convert("L").resize((IMG, IMG), Image.BILINEAR)
    return np.asarray(g, dtype=np.float32) / 255.0


# ----------------------------------------------------------------------------
# 2. HANDCRAFTED DESCRIPTORS  (no pretrained weights; pure numpy / PIL)
#    They complement the Mars-trained latent so that colour, noise, clipping,
#    banding and frequency-content differences are also detected.
# ----------------------------------------------------------------------------
_YY, _XX = np.mgrid[0:IMG, 0:IMG]
_RADIUS = np.sqrt((_YY - IMG // 2) ** 2 + (_XX - IMG // 2) ** 2)
_RAD_EDGES = np.linspace(0, IMG // 2, 9)


def handcrafted_features(gray, rgb_small):
    """gray: float32 (227,227) in [0,1]; rgb_small: PIL RGB 227x227. Returns 1-D float vector."""
    feats = []

    hist, _ = np.histogram(gray, bins=16, range=(0.0, 1.0))
    feats.extend((hist / hist.sum()).tolist())                       # 16 intensity-histogram bins

    feats.extend([gray.mean(), gray.std(),
                  np.percentile(gray, 5), np.percentile(gray, 95)])    # 4 global stats

    gx = np.abs(np.diff(gray, axis=1))
    gy = np.abs(np.diff(gray, axis=0))
    grad = np.concatenate([gx.ravel(), gy.ravel()])
    feats.extend([grad.mean(), grad.std(), float((grad > 0.1).mean())])  # 3 gradient / edge-density

    blur = (gray[:-2, :-2] + gray[:-2, 1:-1] + gray[:-2, 2:] +
            gray[1:-1, :-2] + gray[1:-1, 1:-1] + gray[1:-1, 2:] +
            gray[2:, :-2] + gray[2:, 1:-1] + gray[2:, 2:]) / 9.0
    feats.append(float((gray[1:-1, 1:-1] - blur).std()))               # 1 noise estimate

    power = np.abs(np.fft.fftshift(np.fft.fft2(gray - gray.mean()))) ** 2
    for b in range(8):
        mask = (_RADIUS >= _RAD_EDGES[b]) & (_RADIUS < _RAD_EDGES[b + 1])
        feats.append(float(np.log1p(power[mask].mean())))               # 8 radial spectrum bins

    feats.extend([float((gray <= 0.01).mean()), float((gray >= 0.99).mean())])  # 2 clipping fractions
    feats.extend([float(gray.mean(axis=1).std()), float(gray.mean(axis=0).std())])  # 2 row/col banding

    rgb = np.asarray(rgb_small, dtype=np.float32) / 255.0
    sat = np.asarray(rgb_small.convert("HSV"), dtype=np.float32)[..., 1] / 255.0
    feats.extend([float(sat.mean()), float(sat.std()),
                  float(np.abs(rgb[..., 0] - rgb[..., 1]).mean()),
                  float(np.abs(rgb[..., 1] - rgb[..., 2]).mean())])     # 4 colour statistics
    return np.asarray(feats, dtype=np.float32)


# ----------------------------------------------------------------------------
# 3. SCORING HELPERS
# ----------------------------------------------------------------------------
def robust_standardize(M):
    """Median / MAD scaling per column (outlier-resistant), clipped to +-10."""
    med = np.median(M, axis=0)
    mad = np.median(np.abs(M - med), axis=0) * 1.4826
    std = M.std(axis=0)
    scale = np.maximum(mad, 0.5 * std)
    scale[scale < 1e-8] = 1.0
    return np.clip((M - med) / scale, -10.0, 10.0)


def modified_z(scores):
    """Iglewicz-Hoaglin modified z-score (robust to the skew of IF scores)."""
    med = np.median(scores)
    mad = np.median(np.abs(scores - med))
    if mad < 1e-12:
        std = scores.std()
        return (scores - med) / (std if std > 1e-12 else 1.0)
    return 0.6745 * (scores - med) / mad


def error_overlay(gray, recon, alpha=0.5):
    """Jet heatmap of |original - reconstruction| blended over the image. Returns RGB uint8."""
    from scipy.ndimage import gaussian_filter
    import matplotlib
    err = gaussian_filter(np.abs(gray - recon), sigma=2.0)
    err = err / max(np.percentile(err, 99), 1e-6)
    err = np.clip(err, 0, 1)
    heat = matplotlib.colormaps["jet"](err)[..., :3]
    base = np.repeat(gray[..., None], 3, axis=2)
    return (255 * ((1 - alpha) * base + alpha * heat)).astype(np.uint8)


def _thumb(rgb, max_side=260):
    w, h = rgb.size
    s = max_side / max(w, h)
    if s < 1:
        rgb = rgb.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
    return np.asarray(rgb, dtype=np.uint8)


# ----------------------------------------------------------------------------
# 4. ENGINE  (backend used by the notebook UI and the Streamlit app)
# ----------------------------------------------------------------------------
class AnomalyEngine:
    def __init__(self, artifacts_dir="artifacts", device=None):
        self.artifacts_dir = Path(artifacts_dir)
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))
        self.model = None
        self.mars_pipe = None
        self.mars_meta = None
        self._load_artifacts()

    def _load_artifacts(self):
        ckpt_path = self.artifacts_dir / "final_model.pth"
        if ckpt_path.exists():
            ckpt = torch.load(ckpt_path, map_location=self.device)
            self.model = ConvAE(latent_dim=ckpt["latent_dim"], variational=ckpt["variational"],
                                base=ckpt["base"]).to(self.device)
            self.model.load_state_dict(ckpt["state_dict"])
            self.model.eval()
        pipe_path = self.artifacts_dir / "iforest_mars.joblib"
        meta_path = self.artifacts_dir / "threshold.json"
        if pipe_path.exists() and meta_path.exists():
            self.mars_pipe = joblib.load(pipe_path)
            self.mars_meta = json.loads(meta_path.read_text())

    @property
    def has_model(self):
        return self.model is not None

    @torch.no_grad()
    def _encode_decode(self, grays, batch=32):
        latents, recons = [], []
        for i in range(0, len(grays), batch):
            xb = torch.from_numpy(np.stack(grays[i:i + batch])).unsqueeze(1).to(self.device)
            recon, mu, _ = self.model(xb)
            latents.append(mu.cpu().numpy())
            recons.append(recon.squeeze(1).cpu().numpy())
        return np.concatenate(latents), np.concatenate(recons)

    def run(self, folder, top_k=5, band=0.10, mode="batch", max_band=24, progress=None):
        """
        mode="batch": fit a fresh Isolation Forest on THIS batch only -> 'most different within the batch'.
        mode="mars" : score against the Mars-trained pipeline and the Phase-2 statistical threshold.
        band        : near-miss tier = images NOT in the top-k whose normalised score lies within
                      `band` (e.g. 0.10 = 10 percentage points) of the k-th image's normalised score.
        """
        def report(frac, text):
            if progress is not None:
                progress(frac, text)

        if mode == "mars" and (not self.has_model or self.mars_pipe is None):
            raise RuntimeError("Mars mode needs artifacts/ (final_model.pth, iforest_mars.joblib, "
                               "threshold.json). Run the training sections of the notebook first.")

        paths = collect_image_paths(folder)
        if len(paths) == 0:
            raise ValueError(f"No images found in '{folder}'. Supported: {sorted(IMAGE_EXTS)}")

        names, grays, rgbs_small, thumbs, hand = [], [], [], [], []
        failed = []
        for i, p in enumerate(paths):
            report(0.05 + 0.35 * i / len(paths), f"Reading images {i + 1}/{len(paths)}")
            rgb = load_rgb(p)
            if rgb is None:
                failed.append(str(p))
                continue
            gray = to_gray227(rgb)
            small = rgb.resize((IMG, IMG), Image.BILINEAR)
            names.append(str(p.relative_to(Path(folder))))
            grays.append(gray)
            rgbs_small.append(small)
            thumbs.append(_thumb(rgb))
            hand.append(handcrafted_features(gray, small))
        n = len(grays)
        if n < 3:
            raise ValueError(f"Need at least 3 readable images, found {n}.")
        top_k = int(min(top_k, n))

        latents, recons = None, None
        if self.has_model:
            report(0.45, "Encoding with the Mars-trained autoencoder")
            latents, recons = self._encode_decode(grays)

        report(0.7, "Scoring novelty")
        hand = np.stack(hand)
        hz = robust_standardize(hand) / np.sqrt(hand.shape[1])
        if mode == "mars":
            Z = latents
            if self.mars_pipe["scaler"] is not None:
                Z = self.mars_pipe["scaler"].transform(Z)
            scores = -self.mars_pipe["iforest"].score_samples(Z)
            threshold = float(self.mars_meta["threshold"])
            feat_space = None
        else:
            if latents is not None:
                zz = robust_standardize(latents) / np.sqrt(latents.shape[1])
                feat_space = np.hstack([zz, hz])
            else:
                feat_space = hz
            scores = np.zeros(n)
            n_seeds = 5
            for seed in range(n_seeds):
                forest = IsolationForest(n_estimators=300, max_samples=min(256, n),
                                         contamination="auto", random_state=seed)
                forest.fit(feat_space)
                scores += -forest.score_samples(feat_space)   # higher = more anomalous (competition convention)
            scores /= n_seeds
            threshold = None

        s_min, s_max = float(scores.min()), float(scores.max())
        norm = (scores - s_min) / max(s_max - s_min, 1e-12)
        zmod = modified_z(scores)
        order = np.argsort(-scores)

        second_opinion = None
        if feat_space is not None:
            center = np.median(feat_space, axis=0)
            dist = np.linalg.norm(feat_space - center, axis=1)
            from scipy.stats import spearmanr
            second_opinion = float(spearmanr(scores, dist)[0])

        kth_norm = norm[order[top_k - 1]]
        records = []
        for rank, idx in enumerate(order[:top_k], start=1):
            records.append(self._record(idx, rank, "top", names, scores, norm, zmod, thumbs,
                                        grays, recons, threshold))
        rank = top_k
        for idx in order[top_k:]:
            if norm[idx] >= kth_norm - band and (rank - top_k) < max_band:
                rank += 1
                records.append(self._record(idx, rank, "near", names, scores, norm, zmod, thumbs,
                                            grays, recons, threshold))
            else:
                break
        report(1.0, "Done")
        return {"records": records, "n_images": n, "failed": failed, "mode": mode,
                "used_model": self.has_model, "threshold": threshold, "band": band, "top_k": top_k,
                "all_names": names, "all_scores": scores.tolist(), "spearman_vs_distance": second_opinion}

    def _record(self, idx, rank, tier, names, scores, norm, zmod, thumbs, grays, recons, threshold):
        heat = None
        max_err, mean_err, p95_err, affected_area = 0.0, 0.0, 0.0, 0.0
        if recons is not None:
            heat = error_overlay(grays[idx], recons[idx])
            from scipy.ndimage import gaussian_filter
            err = gaussian_filter(np.abs(grays[idx] - recons[idx]), sigma=2.0)
            max_err = float(err.max())
            mean_err = float(err.mean())
            p95_err = float(np.percentile(err, 95))
            affected_area = float((err > 0.3).mean() * 100)
            
        rec = {"rank": rank, "tier": tier, "name": names[idx], "score": float(scores[idx]),
               "score_norm": float(norm[idx]), "z": float(zmod[idx]),
               "stands_out": bool(zmod[idx] > 3.5), "original": thumbs[idx], "heatmap": heat,
               "max_err": max_err, "mean_err": mean_err, "p95_err": p95_err, "affected_area": affected_area}
        if threshold is not None:
            rec["flagged"] = bool(scores[idx] > threshold)
        return rec


# ----------------------------------------------------------------------------
# 5. GALLERY RENDERING (HTML for the notebook UI)
# ----------------------------------------------------------------------------
def _png_b64(arr):
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG", quality=88)
    return base64.b64encode(buf.getvalue()).decode("ascii")


_CSS = """
<style>
.mz-wrap{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:1100px}
.mz-h{margin:18px 0 4px;font-size:18px;font-weight:650}
.mz-sub{opacity:.7;font-size:13px;margin-bottom:10px}
.mz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.mz-card{border:1px solid rgba(128,128,128,.35);border-radius:12px;padding:10px;position:relative}
.mz-card img{width:100%;border-radius:8px;display:block;margin-bottom:6px}
.mz-badge{position:absolute;top:8px;left:8px;background:#d9480f;color:#fff;font-weight:700;
 border-radius:999px;padding:2px 10px;font-size:12px;z-index:2}
.mz-badge.near{background:#6c757d}
.mz-name{font-size:12px;opacity:.75;word-break:break-all;margin-top:2px}
.mz-meta{font-size:13px;margin-top:4px}
.mz-pill{display:inline-block;font-size:11px;border-radius:6px;padding:1px 7px;margin-left:4px;
 border:1px solid rgba(128,128,128,.5)}
.mz-bar{height:6px;border-radius:3px;background:rgba(128,128,128,.25);margin-top:6px}
.mz-bar>div{height:6px;border-radius:3px;background:#d9480f}
.mz-lab{font-size:11px;opacity:.6;margin:2px 0}
</style>
"""


def _card_html(rec, with_heat):
    badge_cls = "mz-badge" if rec["tier"] == "top" else "mz-badge near"
    html = [f'<div class="mz-card"><span class="{badge_cls}">#{rec["rank"]}</span>']
    html.append(f'<div class="mz-lab">Original</div><img src="data:image/jpeg;base64,{_png_b64(rec["original"])}"/>')
    if with_heat and rec["heatmap"] is not None:
        html.append(f'<div class="mz-lab">Reconstruction-error heatmap</div>'
                    f'<img src="data:image/jpeg;base64,{_png_b64(rec["heatmap"])}"/>')
    pills = ""
    if "flagged" in rec:
        pills += f'<span class="mz-pill">{"above threshold" if rec["flagged"] else "below threshold"}</span>'
    else:
        pills += f'<span class="mz-pill">{"clear outlier" if rec["stands_out"] else "weak outlier"}</span>'
    html.append(f'<div class="mz-meta">score {rec["score"]:.3f} &middot; z {rec["z"]:.1f}{pills}</div>')
    html.append(f'<div class="mz-bar"><div style="width:{100 * rec["score_norm"]:.0f}%"></div></div>')
    html.append(f'<div class="mz-name">{rec["name"]}</div></div>')
    return "".join(html)


def render_gallery_html(result):
    top = [r for r in result["records"] if r["tier"] == "top"]
    near = [r for r in result["records"] if r["tier"] == "near"]
    parts = [_CSS, '<div class="mz-wrap">']
    mode_txt = ("scored against the Mars-trained model + statistical threshold"
                if result["mode"] == "mars" else "most different within this batch")
    parts.append(f'<div class="mz-sub">{result["n_images"]} images analysed &middot; {mode_txt}'
                 + ("" if result["used_model"] else " &middot; (no trained model found: handcrafted features only)")
                 + "</div>")
    parts.append(f'<div class="mz-h">Top {len(top)} most different images</div>')
    parts.append('<div class="mz-grid">' + "".join(_card_html(r, True) for r in top) + "</div>")
    pct = int(round(100 * result["band"]))
    parts.append(f'<div class="mz-h">Next tier: within {pct}% of the #{len(top)} image</div>')
    if near:
        parts.append(f'<div class="mz-sub">{len(near)} close-call image(s) whose normalised score is at most '
                     f'{pct} points below image #{len(top)}.</div>')
        parts.append('<div class="mz-grid">' + "".join(_card_html(r, False) for r in near) + "</div>")
    else:
        parts.append(f'<div class="mz-sub">No other image is within {pct}% of the #{len(top)} image: '
                     'the top group is clearly separated.</div>')
    if result["failed"]:
        parts.append(f'<div class="mz-sub">Skipped {len(result["failed"])} unreadable file(s).</div>')
    parts.append("</div>")
    return "".join(parts)
