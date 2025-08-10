// form_builder.js

const formState = {
  title: "Untitled Form",
  description: "",
  sections: [],
  selectedSectionId: null,
  selectedQuestionId: null,
};

const formPreview = document.getElementById("formPreview");

// Utils
const generateId = () => `id${Date.now()}`;

// Rendering Functions
function renderForm() {
  formPreview.innerHTML = `
    <div class="form-header">
      <input type="text" id="form-title" value="${formState.title}" placeholder="Form Title" />
      <textarea id="form-desc" placeholder="Form Description">${formState.description}</textarea>
    </div>
    <div id="form-body">${formState.sections.map(renderSection).join("")}</div>
    <div class="form-controls">
      <button onclick="addSection()">+ Add Section</button>
      <button onclick="addQuestion()">+ Add Question</button>
      <button onclick="saveForm()">💾 Save</button>
    </div>
  `;

  bindHeaderInputs();
}

function renderSection(section) {
  const selectedClass = formState.selectedSectionId === section.id ? "selected" : "";
  return `
    <div class="section ${selectedClass}" data-id="${section.id}" onclick="selectSection('${section.id}')">
      <input type="text" value="${section.title}" onchange="editSection('${section.id}', 'title', this.value)" placeholder="Section Title" />
      <textarea onchange="editSection('${section.id}', 'description', this.value)" placeholder="Section Description">${section.description}</textarea>
      <div class="section-questions">
        ${section.questions.map(q => renderQuestion(q, section.id)).join("")}
      </div>
      <div class="section-controls">
        <button onclick="addQuestion('${section.id}')">+ Add Question</button>
        <button onclick="deleteSection('${section.id}')">🗑️ Delete Section</button>
      </div>
    </div>
  `;
}

function renderQuestion(question, sectionId = null) {
  const selectedClass = formState.selectedQuestionId === question.id ? "selected" : "";
  return `
    <div class="question ${selectedClass}" data-id="${question.id}" onclick="selectQuestion('${question.id}')">
      <input type="text" value="${question.label}" onchange="editQuestion('${question.id}', 'label', this.value)" placeholder="Question Label" />
      <select onchange="editQuestion('${question.id}', 'type', this.value)">
        <option value="text" ${question.type === "text" ? "selected" : ""}>Text</option>
        <option value="textarea" ${question.type === "textarea" ? "selected" : ""}>Textarea</option>
        <option value="radio" ${question.type === "radio" ? "selected" : ""}>Multiple Choice</option>
        <option value="checkbox" ${question.type === "checkbox" ? "selected" : ""}>Checkbox</option>
      </select>
      <label><input type="checkbox" ${question.required ? "checked" : ""} onchange="editQuestion('${question.id}', 'required', this.checked)" /> Required</label>
      <button onclick="deleteQuestion('${question.id}', '${sectionId}')">🗑️</button>
    </div>
  `;
}

// Interaction
function bindHeaderInputs() {
  document.getElementById("form-title").addEventListener("input", e => {
    formState.title = e.target.value;
  });
  document.getElementById("form-desc").addEventListener("input", e => {
    formState.description = e.target.value;
  });
}

function selectSection(id) {
  formState.selectedSectionId = id;
  formState.selectedQuestionId = null;
  renderForm();
}

function selectQuestion(id) {
  formState.selectedQuestionId = id;
  renderForm();
}

// Section Controls
function addSection() {
  const id = generateId();
  formState.sections.push({ id, title: "New Section", description: "", questions: [] });
  formState.selectedSectionId = id;
  renderForm();
}

function deleteSection(id) {
  formState.sections = formState.sections.filter(sec => sec.id !== id);
  if (formState.selectedSectionId === id) formState.selectedSectionId = null;
  renderForm();
}

function editSection(id, key, value) {
  const section = formState.sections.find(s => s.id === id);
  if (section) {
    section[key] = value;
    renderForm();
  }
}

// Question Controls
function addQuestion(sectionId = null) {
  const newQ = {
    id: generateId(),
    type: "text",
    label: "New Question",
    name: `q_${Date.now()}`,
    required: false,
    options: [],
  };

  if (sectionId) {
    const section = formState.sections.find(s => s.id === sectionId);
    section?.questions.push(newQ);
  } else if (formState.selectedSectionId) {
    const section = formState.sections.find(s => s.id === formState.selectedSectionId);
    section?.questions.push(newQ);
  } else {
    formState.sections.push({ id: generateId(), title: "General", description: "", questions: [newQ] });
  }

  formState.selectedQuestionId = newQ.id;
  renderForm();
}

function editQuestion(id, key, value) {
  for (let section of formState.sections) {
    const question = section.questions.find(q => q.id === id);
    if (question) {
      question[key] = value;
      break;
    }
  }
  renderForm();
}

function deleteQuestion(id, sectionId = null) {
  for (let section of formState.sections) {
    section.questions = section.questions.filter(q => q.id !== id);
  }
  if (formState.selectedQuestionId === id) formState.selectedQuestionId = null;
  renderForm();
}

// Save
function saveForm() {
  console.log("Saved Schema:", JSON.stringify(formState, null, 2));
  // TODO: Use fetch POST or local file saving if backend support is available
}

// Init
renderForm();

// Expose for HTML inline usage
window.addSection = addSection;
window.addQuestion = addQuestion;
window.selectSection = selectSection;
window.selectQuestion = selectQuestion;
window.editSection = editSection;
window.editQuestion = editQuestion;
window.deleteSection = deleteSection;
window.deleteQuestion = deleteQuestion;
window.saveForm = saveForm;
