# Engineering Journal - NSSC 2026 Mars HiRISE Anomaly Detection
Latent size 64 (chosen by the sweep in section 1.1), 2 epochs per version, AdamW lr 0.001, batch 32, seed 42.
Proxy-AUROC = separability of *synthetic* spliced / terrestrial / glitch images from held-out normal crops. It was used **only** to compare
iterations, never for training or for the final threshold.

## v1 - Baseline (CAE + MSE)
- **Setup:** 5-stage strided-conv encoder, linear bottleneck, mirrored transposed-conv decoder, plain MSE, raw latent -> Isolation Forest.
- **Result:** val MSE 0.04784, val SSIM 0.5322, sharpness ratio 1.072, proxy AUROC 0.730.

## v2 - Add an SSIM term to the loss
- **Symptom:** v1 reconstructions keep 107% of the input's gradient energy (sharpness ratio 1.072; 1.0 = as sharp as the input) with val SSIM 0.5322. Blur is mild, so this change tests whether structure-aware training still helps.
- **Diagnosis:** MSE rewards the conditional-mean pixel value, so uncertain fine structure is averaged away; MSE also barely penalises misplaced edges.
- **Fix:** loss = 10 x MSE + (1 - SSIM) with a custom Gaussian-window SSIM (MSE keeps absolute brightness, SSIM keeps local structure).
- **Outcome:** val SSIM 0.5322 -> 0.6047 (improved); sharpness ratio 1.072 -> 0.128 (got worse); val MSE 0.04784 -> 0.03330 (improved); proxy AUROC 0.730 -> 0.798 (improved).

## v3 - Regularised latent (VAE) and standardised latent for the Isolation Forest
- **Symptom:** in v2 the latent geometry is uneven: per-dimension scale CV 0.62, effective dimensionality 1.0 of 64; the weakest proxy class is **splice** (AUROC 0.696).
- **Diagnosis:** an unregularised autoencoder places codes in an arbitrary geometry; the Isolation Forest splits on random axis-aligned cuts, so a few high-variance dimensions dominate isolation depth and the rest are wasted.
- **Fix:** variational bottleneck (KL weight 0.001, warm-up 1 epochs) so the latent is pulled toward a common scale, plus per-dimension standardisation before the forest. The mean `mu` is the latent vector.
- **Outcome:** scale CV 0.62 -> 0.57; effective dims 1.0 -> 1.4; proxy AUROC 0.798 -> 0.786 (got worse); val SSIM 0.6047 -> 0.6032 (got worse).

## Final selection and thresholding
- **Selected version:** v2 (highest proxy AUROC).
- **Threshold:** mad = 0.44965 flags 98 of 500 crops (19.60%). The score distribution has skewness 1.93 and excess kurtosis 2.97, so mu + k sigma was not used as the primary rule; the robust modified z-score (median/MAD) was, with elbow and KDE-valley as cross-checks. Isolation Forest contamination = 'auto' (not used to fix the count).
- **Honest limits:** iterations need not improve every metric; the proxy set approximates, but does not equal, the hidden Genesis Outliers; the heatmap hypotheses in 3.2 are physical interpretations, not confirmed classes.
