# Streamlit front end (optional): run with   streamlit run app.py
import tempfile, io
from pathlib import Path
import streamlit as st
import mars_backend as mb

st.set_page_config(page_title="Most different images", layout="wide")
st.title("Find the most different images")
st.caption("Drop any folder of images (or a .zip). The tool returns the top-K most different images, then the near-miss tier.")

@st.cache_resource
def get_engine():
    return mb.AnomalyEngine("artifacts")

engine = get_engine()
with st.sidebar:
    mode = st.radio("Mode", ["batch", "mars"], format_func=lambda m: "Any images (batch)" if m == "batch" else "Mars crops (trained model)")
    top_k = st.slider("Top-K", 1, 20, 5)
    band = st.slider("Near-miss band", 0.0, 0.5, 0.10, 0.01, format="%.2f")
    folder = st.text_input("Folder path (optional)", "input_images")
    uploads = st.file_uploader("...or upload images / a .zip", accept_multiple_files=True)
    st.write("Trained model loaded:", engine.has_model)

if st.button("Find most different images", type="primary"):
    work = Path(tempfile.mkdtemp())
    src = Path(folder) if folder and Path(folder).exists() and not uploads else work
    for up in uploads or []:
        if up.name.lower().endswith(".zip"):
            mb.extract_zip_into(up.getvalue(), work)
        else:
            (work / up.name).write_bytes(up.getvalue())
    bar = st.progress(0.0)
    try:
        res = engine.run(src, top_k=top_k, band=band, mode=mode, progress=lambda f, t: bar.progress(min(1.0, f), text=t))
    except Exception as exc:
        st.error(str(exc))
        st.stop()
    top = [r for r in res["records"] if r["tier"] == "top"]
    near = [r for r in res["records"] if r["tier"] == "near"]
    st.subheader(f"Top {len(top)} most different (of {res['n_images']} images)")
    cols = st.columns(min(5, len(top)))
    for i, rec in enumerate(top):
        with cols[i % len(cols)]:
            st.image(rec["original"], caption=f"#{rec['rank']}  score {rec['score']:.3f}  z {rec['z']:.1f}")
            if rec["heatmap"] is not None:
                st.image(rec["heatmap"], caption="reconstruction-error heatmap")
            st.caption(rec["name"])
    st.subheader(f"Next tier: within {int(round(band * 100))}% of #{len(top)}")
    if near:
        cols = st.columns(5)
        for i, rec in enumerate(near):
            with cols[i % 5]:
                st.image(rec["original"], caption=f"#{rec['rank']}  score {rec['score']:.3f}")
                st.caption(rec["name"])
    else:
        st.info("No other image is that close - the top group is clearly separated.")
