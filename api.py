from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import tempfile
from pathlib import Path
import os
import base64
from io import BytesIO
import numpy as np
from PIL import Image

# Import the engine from the notebook logic
import mars_backend as mb

app = FastAPI(title="NSSC 2026 Anomaly Intelligence Backend")

# Allow CORS for the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine globally
engine = mb.AnomalyEngine("artifacts")

def img_to_base64(img) -> str:
    if img is None:
        return None
    
    # If the image is a numpy array, convert it to a PIL Image
    if isinstance(img, np.ndarray):
        img = Image.fromarray(img)
        
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    return "data:image/jpeg;base64," + base64.b64encode(buffered.getvalue()).decode('utf-8')

@app.get("/api/status")
def get_status():
    return {
        "status": "NOMINAL",
        "has_model": engine.has_model,
        "mars_pipe": engine.mars_pipe is not None
    }

@app.post("/api/analyze")
async def analyze_images(files: List[UploadFile] = File(...)):
    # Create a temporary directory to save the uploaded images
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Save all uploaded files to the temp directory
        saved_names = []
        for i, file in enumerate(files):
            file_path = temp_path / file.filename
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())
            saved_names.append(file.filename)
            
        # The backend requires at least 3 images to compute statistics (MAD, z-score, etc.)
        # If the user uploaded less than 3, we just duplicate the first one under a fake name
        pad_idx = 0
        while len(list(temp_path.glob("*"))) < 3:
            import shutil
            shutil.copy(temp_path / saved_names[0], temp_path / f"padded_copy_{pad_idx}.jpg")
            pad_idx += 1
        
        # Run the anomaly engine (using "mars" mode to use the newly trained model)
        # Using a very low top_k limit if few files, else 5
        top_k = min(5, max(1, len(files)))
        
        try:
            # We explicitly use mode="mars" to use the model trained on Google Drive data!
            res = engine.run(temp_path, top_k=top_k, band=0.1, mode="mars")
        except Exception as e:
            print(f"ERROR in engine.run: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": str(e)}

        # Process the results and encode images to base64
        processed_records = []
        for rec in res["records"]:
            processed_records.append({
                "name": rec["name"],
                "rank": rec["rank"],
                "tier": rec["tier"],
                "score": float(rec["score"]),
                "z": float(rec.get("z", 0.0)),
                "stands_out": bool(rec.get("stands_out", False)),
                "flagged": bool(rec.get("flagged", False)),
                "max_err": float(rec.get("max_err", 0.0)),
                "mean_err": float(rec.get("mean_err", 0.0)),
                "p95_err": float(rec.get("p95_err", 0.0)),
                "affected_area": float(rec.get("affected_area", 0.0)),
                "original_b64": img_to_base64(rec["original"]),
                "heatmap_b64": img_to_base64(rec["heatmap"])
            })

        return {
            "n_images": int(res["n_images"]),
            "records": processed_records
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
