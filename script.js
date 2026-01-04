// ===============================
// GLOBAL VARIABLES
// ===============================
let myNotes = JSON.parse(localStorage.getItem("myNotes")) || [];
let editIndex = -1;

// ===============================
// DARK MODE (FIXED)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // apply dark mode on load
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) document.body.classList.add("dark");

  showNotes();
});

function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
}

// ===============================
// AI-LIKE HELPERS
// ===============================
function getSummary(text) {
  let parts = text.split(".");
  return parts.length > 2
    ? parts[0] + "." + parts[1] + "..."
    : text;
}

function getTitleAndTags(text) {
  let words = text.toLowerCase().split(" ");
  let title = words.slice(0, 5).join(" ") + "...";
  let tags = [];

  if (words.includes("exam") || words.includes("study")) tags.push("📚 Study");
  if (words.includes("work")) tags.push("💼 Work");
  if (words.includes("idea")) tags.push("💡 Idea");

  if (tags.length === 0) tags.push("📝 Personal");

  return { title, tags };
}

function analyzeNote(text) {
  let { title, tags } = getTitleAndTags(text);

  return {
    title,
    tags,
    summary: getSummary(text),
    mood: "😐 Neutral"
  };
}

// ===============================
// SAVE NOTE
// ===============================
function saveNote() {
  let input = document.getElementById("noteInput");
  let text = input.value.trim();

  if (text === "") {
    alert("Write something!");
    return;
  }

  let ai = analyzeNote(text);

  let note = {
    id: Date.now(),
    text,
    title: ai.title,
    tags: ai.tags,
    summary: ai.summary,
    mood: ai.mood,
    isStarred: editIndex !== -1 ? myNotes[editIndex].isStarred : false,
    time: Date.now()
  };

  if (editIndex === -1) {
    myNotes.push(note);
  } else {
    myNotes[editIndex] = note;
    editIndex = -1;
  }

  localStorage.setItem("myNotes", JSON.stringify(myNotes));
  input.value = "";
  showNotes();
}

// ===============================
// STAR (PRIORITY)
// ===============================
function toggleStar(index) {
  myNotes[index].isStarred = !myNotes[index].isStarred;
  localStorage.setItem("myNotes", JSON.stringify(myNotes));
  showNotes();
}

// ===============================
// EDIT & DELETE
// ===============================
function editNote(index) {
  document.getElementById("noteInput").value = myNotes[index].text;
  editIndex = index;
}

function deleteNote(index) {
  if (!confirm("Delete this note?")) return;
  myNotes.splice(index, 1);
  localStorage.setItem("myNotes", JSON.stringify(myNotes));
  showNotes();
}

// ===============================
// SORT LOGIC (⭐ + ⏰)
// ===============================
function sortNotes(notes) {
  return notes.sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return b.time - a.time;
  });
}

// ===============================
// SEARCH
// ===============================
function searchNotes() {
  let q = document.getElementById("searchInput").value
    .toLowerCase()
    .trim();

  if (q === "") {
    showNotes();
    return;
  }

  let matched = [];
  let others = [];

  myNotes.forEach(note => {
    let content = (
      note.text +
      note.title +
      note.tags.join(" ")
    ).toLowerCase();

    if (content.includes(q)) matched.push(note);
    else others.push(note);
  });

  showNotes([...matched, ...others], q);
}

// ===============================
// DISPLAY NOTES
// ===============================
function showNotes(customList = null, highlight = "") {
  let list = customList || sortNotes([...myNotes]);
  let container = document.getElementById("notesList");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p>No notes found</p>";
    return;
  }

  list.forEach(note => {
    let index = myNotes.indexOf(note);
    let highlightClass = "";

    if (highlight) {
      let full = (
        note.text +
        note.title +
        note.tags.join(" ")
      ).toLowerCase();

      if (full.includes(highlight)) {
        highlightClass = "highlighted";
      }
    }

    container.innerHTML += `
      <div class="note ${highlightClass}">
        <h3>
          ${note.title}
          <span onclick="toggleStar(${index})" style="cursor:pointer">
            ${note.isStarred ? "⭐" : "☆"}
          </span>
        </h3>

        <p><b>Tags:</b> ${note.tags.join(", ")}</p>
        <p><b>Summary:</b> ${note.summary}</p>

        <div class="actions">
          <button onclick="editNote(${index})">✏️ Edit</button>
          <button onclick="deleteNote(${index})">🗑 Delete</button>
        </div>
      </div>
    `;
  });
}
