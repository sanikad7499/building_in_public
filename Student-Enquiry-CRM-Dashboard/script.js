
const indianNames = [
    "Aarav Sharma",
    "Vivaan Patil",
    "Aditya Kulkarni",
    "Rohan Deshmukh",
    "Aryan Gupta",
    "Ananya Joshi",
    "Sneha Patil",
    "Priya Nair",
    "Isha Verma",
    "Kavya Singh"
];
const studentList = document.getElementById("studentList");
const studentDetails = document.getElementById("studentDetails");
const searchInput = document.getElementById("searchInput");

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const retryBtn = document.getElementById("retryBtn");

const totalCount = document.getElementById("totalCount");
const newCount = document.getElementById("newCount");
const interestedCount = document.getElementById("interestedCount");
const closedCount = document.getElementById("closedCount");

const generateSummary = document.getElementById("generateSummary");
const summaryBox = document.getElementById("summaryBox");



let students = [];
let filteredStudents = [];
let selectedStudent = null;




const courses = [
    "Full Stack Development",
    "Python Programming",
    "Data Analytics",
    "AI & Machine Learning",
    "Java Development",
    "Cloud Computing",
    "UI/UX Design",
    "Digital Marketing"
];

const statuses = [
    "New",
    "Contacted",
    "Interested",
    "Closed"
];

const notesList = [
    "Requested fee details.",
    "Interested in weekend batches.",
    "Needs scholarship information.",
    "Requested callback tomorrow.",
    "Asked for demo lecture.",
    "Interested after graduation.",
    "Needs placement details.",
    "Requested course brochure.",
    "Parents will visit campus.",
    "Will decide next week."
];



function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(days) {

    const date = new Date();

    date.setDate(date.getDate() - Math.floor(Math.random() * days));

    return date.toLocaleDateString("en-GB");

}



function createStudentRecord(user) {

    return {

        id: user.id,

        name: indianNames[user.id - 1],

        email: user.email,

        phone: user.phone,

        course: randomItem(courses),

        enquiryDate: randomDate(40),

        followUpDate: randomDate(10),

        status: randomItem(statuses),

        notes: randomItem(notesList)

    };

}



function showLoading() {

    loading.classList.remove("hidden");
    error.classList.add("hidden");
    studentList.innerHTML = "";

}

function hideLoading() {

    loading.classList.add("hidden");

}



function showError() {

    loading.classList.add("hidden");
    error.classList.remove("hidden");

}




async function fetchStudents() {

    showLoading();

    try {

        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );

        if (!response.ok) {

            throw new Error("API Error");

        }

        const data = await response.json();

        students = data
            .slice(0, 10)
            .map(createStudentRecord);

        filteredStudents = [...students];

        hideLoading();

        renderStudentList(filteredStudents);

        updateStatistics();

        if (students.length > 0) {

            showStudentDetails(students[0]);

        }

    }

    catch (err) {

        console.error(err);

        showError();

    }

}




function renderStudentList(list) {

    studentList.innerHTML = "";

    if (list.length === 0) {

        studentList.innerHTML = `
            <div class="placeholder">
                <h3>No Students Found</h3>
            </div>
        `;

        return;

    }

    list.forEach(student => {

        const card = document.createElement("div");

        card.className = "student-card";

        if (
            selectedStudent &&
            selectedStudent.id === student.id
        ) {

            card.classList.add("active");

        }

        card.innerHTML = `

            <div class="student-info">

                <h3 class="student-name">
                    ${student.name}
                </h3>

                <p class="student-course">
                    ${student.course}
                </p>

            </div>

            <span class="status ${student.status.toLowerCase()}">
                ${student.status}
            </span>

        `;

        card.addEventListener("click", () => {

            showStudentDetails(student);

        });

        studentList.appendChild(card);

    });

}




function updateStatistics() {

    totalCount.textContent = students.length;

    newCount.textContent =
        students.filter(
            s => s.status === "New"
        ).length;

    interestedCount.textContent =
        students.filter(
            s => s.status === "Interested"
        ).length;

    closedCount.textContent =
        students.filter(
            s => s.status === "Closed"
        ).length;

}


function showStudentDetails(student) {

    selectedStudent = student;

    studentDetails.innerHTML = `

        <div class="detail-item">
            <div class="detail-label">Name</div>
            <div class="detail-value">${student.name}</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${student.email}</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Phone Number</div>
            <div class="detail-value">${student.phone}</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Interested Course</div>
            <div class="detail-value">${student.course}</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Enquiry Date</div>
            <div class="detail-value">${student.enquiryDate}</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Last Follow-up</div>
            <div class="detail-value">${student.followUpDate}</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">
                <span class="status ${student.status.toLowerCase()}">
                    ${student.status}
                </span>
            </div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Notes</div>
            <div class="detail-value">${student.notes}</div>
        </div>

    `;

    // Highlight selected card
    renderStudentList(filteredStudents);

    // Reset AI summary
    summaryBox.innerHTML = `
        <p>Select "Generate Follow-up Summary" to create an AI follow-up message.</p>
    `;
}



searchInput.addEventListener("input", function () {

    const keyword = this.value.trim().toLowerCase();

    filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(keyword)
    );

    renderStudentList(filteredStudents);

});


// AI Summary Generator
generateSummary.addEventListener("click", function () {

    if (!selectedStudent) {

        summaryBox.innerHTML = `
            <p>Please select a student first.</p>
        `;
        return;

    }

    let summary = "";

    switch (selectedStudent.status) {

        case "New":

            summary =
                `The student has recently enquired about the ${selectedStudent.course} course. Reach out promptly, introduce the program, explain the curriculum, and answer any initial questions to increase engagement.`;

            break;

        case "Contacted":

            summary =
                `The student has already been contacted regarding the ${selectedStudent.course} course. Schedule a follow-up discussion to address remaining concerns and provide detailed information about fees, batches, and admissions.`;

            break;

        case "Interested":

            summary =
                `The student has shown strong interest in the ${selectedStudent.course} program. Share placement opportunities, upcoming batch schedules, and encourage completing the admission process at the earliest.`;

            break;

        case "Closed":

            summary =
                `This enquiry has been marked as closed. Maintain the student's information for future campaigns and send updates whenever new courses or promotional offers become available.`;

            break;

        default:

            summary =
                `Follow up professionally with the student regarding their enquiry and assist them with the next steps.`;

    }

    summary += `<br><br><strong>Notes:</strong> ${selectedStudent.notes}`;

    summaryBox.innerHTML = `<p>${summary}</p>`;

});



retryBtn.addEventListener("click", function () {

    fetchStudents();

});



document.addEventListener("DOMContentLoaded", function () {

    fetchStudents();

});