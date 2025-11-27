let rawData = [];
let courses = [];
let filteredCourses = [];

// Course Class
class Course {
    constructor(data) {
        this.id = data.id ?? "Unknown";
        this.title = data.title ?? "Unknown";
        this.department = data.department ?? "Unknown";
        this.level = data.level ?? "Unknown";
        this.credits = data.credits ?? "Unknown";
        this.instructor = data.instructor ?? "Unknown";
        this.description = data.description ?? "Unknown";
        this.semester = data.semester ?? "Unknown";
    }

    getDetailsHTML() {
        return `
            <h3>${this.title}</h3>
            <p><strong>ID:</strong> ${this.id}</p>
            <p><strong>Department:</strong> ${this.department}</p>
            <p><strong>Level:</strong> ${this.level}</p>
            <p><strong>Credits:</strong> ${this.credits}</p>
            <p><strong>Instructor:</strong> ${this.instructor}</p>
            <p><strong>Semester:</strong> ${this.semester}</p>
            <p><strong>Description:</strong> ${this.description}</p>
        `;
    }
}


// .json File Loading
document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    const errorBox = document.getElementById("loadError");

    errorBox.textContent = ""; // clear previous errors

    if (!file) {
        errorBox.textContent = "No file selected.";
        return;
    }

    // Make sure it's a .json file
    if (!file.name.endsWith(".json")) {
        errorBox.textContent = "Invalid JSON file format.";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const json = JSON.parse(e.target.result);

            // Must be an array
            if (!Array.isArray(json)) {
                throw new Error("JSON is not an array.");
            }

            // Validate course structure
            const requiredFields = [
                "id", "title", "department",
                "level", "credits", "description", "semester"
            ];
            // Go through the .json and ensure each item has required fields
            for (let i = 0; i < json.length; i++) {
                const course = json[i];

                requiredFields.forEach(field => {
                    if (!(field in course)) {
                        throw new Error(`Missing required field '${field}' in item ${i + 1}.`);
                    }
                });
            }

            // If all is good, convert to Course objects
            rawData = json;
            courses = rawData.map(obj => new Course(obj));
            filteredCourses = [...courses];

            populateDropdowns();
            renderCourseList();
        } catch (err) {
            errorBox.textContent = "Invalid JSON file format.";
        }
    };

    reader.readAsText(file);
});



// Dropdowns
function populateDropdowns() {
    fillDropdown("filter-level", courses.map(c => c.level));
    fillDropdown("filter-credits", courses.map(c => c.credits));
    fillDropdown("filter-instructor", courses.map(c => c.instructor ?? "Unknown Instructor"));
    fillDropdown("filter-department", courses.map(c => c.department));
}
function fillDropdown(selectId, values) {
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">Any</option>`;

    const unique = [...new Set(values)];

    unique.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
    });
}


// Filtering 
document.querySelectorAll("#filter-section select").forEach(sel => {
    sel.addEventListener("change", applyFilters);
});

function applyFilters() {
    let levelVal = document.getElementById("filter-level").value;
    let creditsVal = document.getElementById("filter-credits").value;
    let instructorVal = document.getElementById("filter-instructor").value;
    let departmentVal = document.getElementById("filter-department").value;

    filteredCourses = courses.filter(c =>
        (levelVal === "" || c.level.toString() === levelVal) &&
        (creditsVal === "" || c.credits.toString() === creditsVal) &&
        (instructorVal === "" || c.instructor === instructorVal) &&
        (departmentVal === "" || c.department === departmentVal)
    );

    applySort();
    renderCourseList();
}


// Sorting
document.getElementById("sort-select").addEventListener("change", function () {
    applySort();
    renderCourseList();
});

function applySort() { // Generalized sort function
    const sortVal = document.getElementById("sort-select").value;

    // Converts semester strings to comparable values
    const parseSemester = (s) => {
        if (!s || typeof s !== "string") return { year: 0, term: 0 };
        const [term, yearStr] = s.split(" ");
        const year = parseInt(yearStr);
        const order = { Winter: 1, Spring: 2, Summer: 3, Fall: 4 };
        return { year, term: order[term] ?? 0 };
    };

    filteredCourses.sort((a, b) => {
        switch (sortVal) {
            case "title-asc": return a.title.localeCompare(b.title);
            case "title-desc": return b.title.localeCompare(a.title);
            case "id-asc": return a.id.localeCompare(b.id);
            case "id-desc": return b.id.localeCompare(a.id);

            case "date-asc": {
                let A = parseSemester(a.semester);
                let B = parseSemester(b.semester);
                return A.year === B.year ? A.term - B.term : A.year - B.year;
            }

            case "date-desc": {
                let A = parseSemester(a.semester);
                let B = parseSemester(b.semester);
                return A.year === B.year ? B.term - A.term : B.year - A.year;
            }

            default: return 0;
        }
    });
}


// Render the list
function renderCourseList() {
    const ul = document.getElementById("courseList");
    ul.innerHTML = "";

    filteredCourses.forEach(course => {
        const li = document.createElement("li");
        li.textContent = `${course.id} — ${course.title}`;
        li.addEventListener("click", () => showDetails(course));
        ul.appendChild(li);
    });
}

function showDetails(course) {
    document.getElementById("detailsBox").innerHTML = course.getDetailsHTML();
}
