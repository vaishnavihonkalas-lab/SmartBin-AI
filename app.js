const MODEL_URL = "./model/model.json";
const LABELS = ["plastic", "paper", "metal", "glass", "nothing", "Ewaste", "cloth"];
const LOW_CONFIDENCE = 0.55;

let model = null;
let selectedFile = null;

const $ = (id) => document.getElementById(id);
const status = $("model-status");
const statusDot = $("status-dot");
const input = $("image-input");
const dropZone = $("drop-zone");
const preview = $("preview");
const previewWrap = $("preview-wrap");
const predictButton = $("predict-button");
const inputMessage = $("input-message");

function setStatus(message, kind = "") {
  status.textContent = message;
  statusDot.className = `status-dot ${kind}`;
}

async function loadModel() {
  try {
    model = await tf.loadLayersModel(MODEL_URL);
    setStatus("Model ready", "ready");
    inputMessage.textContent = "Upload a clear image with one main object for the best result.";
    predictButton.disabled = !selectedFile;
  } catch (error) {
    console.error(error);
    setStatus("Model unavailable", "error");
    inputMessage.textContent = "Could not load the model. Run the app through a local web server.";
  }
}

function showFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    inputMessage.textContent = "Please choose a JPG, PNG or WEBP image.";
    return;
  }
  selectedFile = file;
  preview.src = URL.createObjectURL(file);
  previewWrap.classList.remove("hidden");
  dropZone.classList.add("hidden");
  predictButton.disabled = !model;
  inputMessage.textContent = model ? "Ready to classify this image." : "Waiting for the model to finish loading…";
}

function resetSelection() {
  selectedFile = null;
  input.value = "";
  preview.src = "";
  previewWrap.classList.add("hidden");
  dropZone.classList.remove("hidden");
  predictButton.disabled = true;
  $("result-content").classList.add("hidden");
  $("empty-state").classList.remove("hidden");
  inputMessage.textContent = model ? "Upload a clear image with one main object for the best result." : "Waiting for the model to finish loading…";
}

function renderScores(scores) {
  const ordered = scores.map((score, index) => ({ label: LABELS[index] || `class ${index + 1}`, score }))
    .sort((a, b) => b.score - a.score);
  const top = ordered[0];
  $("prediction-label").textContent = top.label;
  $("confidence").textContent = `${Math.round(top.score * 100)}% confidence`;
  $("result-note").textContent = top.score < LOW_CONFIDENCE
    ? "This result is uncertain. Try a clearer image and confirm the item manually."
    : "This is the class with the highest model score for the uploaded image.";
  $("score-list").innerHTML = ordered.map((item, index) => `
    <div class="score-row ${index === 0 ? "top" : ""}">
      <span class="score-label">${item.label}</span>
      <span class="bar"><i style="width:${Math.max(1, item.score * 100)}%"></i></span>
      <span class="score-value">${Math.round(item.score * 100)}%</span>
    </div>`).join("");
  $("empty-state").classList.add("hidden");
  $("result-content").classList.remove("hidden");
}

async function classify() {
  if (!model || !selectedFile) return;
  predictButton.disabled = true;
  predictButton.innerHTML = "Analysing…";
  try {
    const image = await createImageBitmap(selectedFile);
    const tensor = tf.tidy(() => {
      const pixels = tf.browser.fromPixels(image).toFloat();
      return pixels.resizeBilinear([224, 224]).sub(127.5).div(127.5).expandDims(0);
    });
    const output = model.predict(tensor);
    const values = Array.from(await output.data());
    tf.dispose([tensor, output]);
    image.close();
    renderScores(values);
  } catch (error) {
    console.error(error);
    inputMessage.textContent = "Prediction failed. Please try another image.";
  } finally {
    predictButton.disabled = false;
    predictButton.innerHTML = "Classify image <span>→</span>";
  }
}

input.addEventListener("change", (event) => showFile(event.target.files[0]));
$("clear-button").addEventListener("click", resetSelection);
predictButton.addEventListener("click", classify);
dropZone.addEventListener("dragover", (event) => { event.preventDefault(); dropZone.classList.add("dragging"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragging"));
dropZone.addEventListener("drop", (event) => { event.preventDefault(); dropZone.classList.remove("dragging"); showFile(event.dataTransfer.files[0]); });
loadModel();
