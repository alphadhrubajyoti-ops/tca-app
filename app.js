/* ============================================================
   TERABYTE COMPUTER ACADEMY
   Student Management Portal
   ============================================================ */


/* ================= ADMIN CREDENTIALS ================= */

const ADMIN_USERNAME = "alpha.dhrubajyoti@gmail.com";
const ADMIN_PASSWORD = "WB9609022523";


/* ================= STORAGE ================= */

let students =
    JSON.parse(localStorage.getItem("tb_students")) || [];

let notices =
    JSON.parse(localStorage.getItem("tb_notices")) || [];

let blogs =
    JSON.parse(localStorage.getItem("tb_blogs")) || [];

let messages =
    JSON.parse(localStorage.getItem("tb_messages")) || [];

let attendance =
    JSON.parse(localStorage.getItem("tb_attendance")) || {};

let settings =
    JSON.parse(localStorage.getItem("tb_settings")) || {
        academyName: "TeraByte Computer Academy"
    };


/* ================= CURRENT USER ================= */

let currentUser =
    JSON.parse(sessionStorage.getItem("tb_current_user")) || null;


let $ = id => document.getElementById(id);


/* ================= UTILITIES ================= */

function saveAll() {

    localStorage.setItem(
        "tb_students",
        JSON.stringify(students)
    );

    localStorage.setItem(
        "tb_notices",
        JSON.stringify(notices)
    );

    localStorage.setItem(
        "tb_blogs",
        JSON.stringify(blogs)
    );

    localStorage.setItem(
        "tb_messages",
        JSON.stringify(messages)
    );

    localStorage.setItem(
        "tb_attendance",
        JSON.stringify(attendance)
    );

    localStorage.setItem(
        "tb_settings",
        JSON.stringify(settings)
    );
}


function money(value) {

    return "₹" +
        Number(value || 0).toLocaleString("en-IN");

}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showToast(message) {

    const toast = $("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


function generateId() {

    return Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8);

}


function generateRegistrationNumber() {

    let highest = 0;

    students.forEach(student => {

        const number =
            parseInt(
                String(student.registrationNumber)
                    .replace(/\D/g, "")
            ) || 0;

        if (number > highest) {
            highest = number;
        }

    });

    return "TB" +
        String(highest + 1).padStart(4, "0");

}


function generatePassword() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let password = "";

    for (let i = 0; i < 8; i++) {

        password +=
            chars[Math.floor(Math.random() * chars.length)];

    }

    return password;

}


/* ================= LOGIN ================= */

function switchLogin(type) {

    if (type === "student") {

        $("studentTab").classList.add("active");
        $("adminTab").classList.remove("active");

        $("studentLoginForm").classList.remove("hidden");
        $("adminLoginForm").classList.add("hidden");

    } else {

        $("adminTab").classList.add("active");
        $("studentTab").classList.remove("active");

        $("adminLoginForm").classList.remove("hidden");
        $("studentLoginForm").classList.add("hidden");

    }

    $("loginMessage").textContent = "";

}


$("studentLoginForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const username =
        $("studentUsername").value.trim().toUpperCase();

    const password =
        $("studentPassword").value;

    const student =
        students.find(
            s =>
                String(s.registrationNumber).toUpperCase() === username &&
                s.password === password
        );

    if (!student) {

        $("loginMessage").textContent =
            "Invalid registration number or password.";

        $("loginMessage").style.color = "#dc2626";

        return;

    }

    currentUser = {
        type: "student",
        id: student.id
    };

    sessionStorage.setItem(
        "tb_current_user",
        JSON.stringify(currentUser)
    );

    openApplication();

});


$("adminLoginForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const username =
        $("adminUsername").value.trim();

    const password =
        $("adminPassword").value;

    if (
        username !== ADMIN_USERNAME ||
        password !== ADMIN_PASSWORD
    ) {

        $("loginMessage").textContent =
            "Invalid admin username or password.";

        $("loginMessage").style.color = "#dc2626";

        return;

    }

    currentUser = {
        type: "admin"
    };

    sessionStorage.setItem(
        "tb_current_user",
        JSON.stringify(currentUser)
    );

    openApplication();

});


/* ================= APPLICATION ================= */

function openApplication() {

    $("loginPage").classList.add("hidden");
    $("app").classList.remove("hidden");

    if (currentUser.type === "admin") {

        $("adminContent").classList.remove("hidden");
        $("studentContent").classList.add("hidden");

        $("adminNavigation").classList.remove("hidden");
        $("studentNavigation").classList.add("hidden");

        $("topUserName").textContent =
            "Administrator";

        $("topUserRole").textContent =
            "Admin / Teacher";

        $("topAvatar").textContent = "A";

        showAdminSection("dashboard");

        refreshAdminDashboard();

    } else {

        $("adminContent").classList.add("hidden");
        $("studentContent").classList.remove("hidden");

        $("adminNavigation").classList.add("hidden");
        $("studentNavigation").classList.remove("hidden");

        const student =
            getCurrentStudent();

        if (!student) {

            logout();

            return;

        }

        $("topUserName").textContent =
            student.name;

        $("topUserRole").textContent =
            "Student";

        $("topAvatar").textContent =
            student.name.charAt(0).toUpperCase();

        $("studentWelcome").textContent =
            "Hello, " + student.name;

        showStudentSection("dashboard");

        refreshStudentDashboard();

    }

}


function getCurrentStudent() {

    if (!currentUser ||
        currentUser.type !== "student") {
        return null;
    }

    return students.find(
        student => student.id === currentUser.id
    );

}


/* ================= LOGOUT ================= */

function logout() {

    sessionStorage.removeItem("tb_current_user");

    currentUser = null;

    $("app").classList.add("hidden");
    $("loginPage").classList.remove("hidden");

    $("studentLoginForm").reset();
    $("adminLoginForm").reset();

    switchLogin("student");

}


/* ================= ADMIN NAVIGATION ================= */

function showAdminSection(section) {

    document
        .querySelectorAll("#adminContent .content-section")
        .forEach(el => el.classList.add("hidden"));

    const element =
        $("admin-" + section);

    if (element) {
        element.classList.remove("hidden");
    }

    document
        .querySelectorAll("#adminNavigation .nav-item")
        .forEach(button => button.classList.remove("active"));

    const button =
        [...document.querySelectorAll("#adminNavigation .nav-item")]
            .find(btn =>
                btn.getAttribute("onclick")?.includes(
                    `'${section}'`
                )
            );

    if (button) {
        button.classList.add("active");
    }

    $("pageTitle").textContent =
        section.charAt(0).toUpperCase() +
        section.slice(1);

    if (section === "students") renderStudents();
    if (section === "attendance") renderAttendance();
    if (section === "fees") renderFees();
    if (section === "notices") renderAdminNotices();
    if (section === "blogs") renderAdminBlogs();
    if (section === "messages") renderAdminMessages();
}


/* ================= STUDENT NAVIGATION ================= */

function showStudentSection(section) {

    document
        .querySelectorAll("#studentContent .content-section")
        .forEach(el => el.classList.add("hidden"));

    const element =
        $("student-" + section);

    if (element) {
        element.classList.remove("hidden");
    }

    document
        .querySelectorAll("#studentNavigation .nav-item")
        .forEach(button => button.classList.remove("active"));

    const button =
        [...document.querySelectorAll("#studentNavigation .nav-item")]
            .find(btn =>
                btn.getAttribute("onclick")?.includes(
                    `'${section}'`
                )
            );

    if (button) {
        button.classList.add("active");
    }

    $("pageTitle").textContent =
        section === "dashboard"
            ? "Dashboard"
            : section.charAt(0).toUpperCase() +
              section.slice(1);

    if (section === "profile") renderStudentProfile();
    if (section === "attendance") renderStudentAttendance();
    if (section === "fees") renderStudentFees();
    if (section === "notices") renderStudentNotices();
    if (section === "blogs") renderStudentBlogs();
    if (section === "messages") renderStudentMessages();

}


/* ================= ADMIN DASHBOARD ================= */

function refreshAdminDashboard() {

    $("totalStudents").textContent =
        students.length;

    let due = 0;

    students.forEach(student => {

        due += Math.max(
            0,
            Number(student.totalFees || 0) -
            Number(student.feesPaid || 0)
        );

    });

    $("pendingFees").textContent =
        money(due);

    $("totalNotices").textContent =
        notices.length;

    const today =
        new Date().toISOString().split("T")[0];

    let present = 0;

    students.forEach(student => {

        if (
            attendance[today] &&
            attendance[today][student.id] === "present"
        ) {
            present++;
        }

    });

    $("presentStudents").textContent =
        present;

    renderRecentStudents();
    renderRecentNotices();

}


/* ================= STUDENTS ================= */

function openStudentModal(studentId = null) {

    $("studentModal").classList.remove("hidden");

    $("studentForm").reset();

    $("editStudentId").value =
        studentId || "";

    $("generatedCredentials")
        .classList.add("hidden");

    if (!studentId) {

        $("studentModalTitle").textContent =
            "Add Student";

        $("studentJoining").value =
            new Date().toISOString().split("T")[0];

        return;

    }

    const student =
        students.find(s => s.id === studentId);

    if (!student) return;

    $("studentModalTitle").textContent =
        "Edit Student";

    $("studentName").value =
        student.name || "";

    $("studentGender").value =
        student.gender || "";

    $("studentDob").value =
        student.dob || "";

    $("studentPhone").value =
        student.phone || "";

    $("studentEmail").value =
        student.email || "";

    $("studentGuardian").value =
        student.guardian || "";

    $("studentGuardianPhone").value =
        student.guardianPhone || "";

    $("studentCourse").value =
        student.course || "Basic Computer";

    $("studentBatch").value =
        student.batch || "";

    $("studentJoining").value =
        student.joiningDate || "";

    $("studentTotalFees").value =
        student.totalFees || 0;

    $("studentFeesPaid").value =
        student.feesPaid || 0;

    $("studentAddress").value =
        student.address || "";

}


function closeStudentModal() {

    $("studentModal").classList.add("hidden");

}


$("studentForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const editId =
        $("editStudentId").value;

    if (editId) {

        const student =
            students.find(s => s.id === editId);

        if (!student) return;

        student.name =
            $("studentName").value.trim();

        student.gender =
            $("studentGender").value;

        student.dob =
            $("studentDob").value;

        student.phone =
            $("studentPhone").value.trim();

        student.email =
            $("studentEmail").value.trim();

        student.guardian =
            $("studentGuardian").value.trim();

        student.guardianPhone =
            $("studentGuardianPhone").value.trim();

        student.course =
            $("studentCourse").value;

        student.batch =
            $("studentBatch").value.trim();

        student.joiningDate =
            $("studentJoining").value;

        student.totalFees =
            Number($("studentTotalFees").value || 0);

        student.feesPaid =
            Number($("studentFeesPaid").value || 0);

        student.address =
            $("studentAddress").value.trim();

        saveAll();

        closeStudentModal();

        renderStudents();

        refreshAdminDashboard();

        showToast("Student profile updated.");

        return;

    }


    const registrationNumber =
        generateRegistrationNumber();

    const password =
        generatePassword();


    const student = {

        id: generateId(),

        registrationNumber,

        password,

        name:
            $("studentName").value.trim(),

        gender:
            $("studentGender").value,

        dob:
            $("studentDob").value,

        phone:
            $("studentPhone").value.trim(),

        email:
            $("studentEmail").value.trim(),

        guardian:
            $("studentGuardian").value.trim(),

        guardianPhone:
            $("studentGuardianPhone").value.trim(),

        course:
            $("studentCourse").value,

        batch:
            $("studentBatch").value.trim(),

        joiningDate:
            $("studentJoining").value,

        totalFees:
            Number($("studentTotalFees").value || 0),

        feesPaid:
            Number($("studentFeesPaid").value || 0),

        address:
            $("studentAddress").value.trim(),

        status:
            "Active",

        createdAt:
            new Date().toISOString()

    };


    students.push(student);

    saveAll();


    $("generatedCredentials")
        .classList.remove("hidden");

    $("generatedReg").textContent =
        registrationNumber;

    $("generatedPassword").textContent =
        password;


    renderStudents();
    refreshAdminDashboard();

    showToast("Student created successfully.");

});


function renderStudents() {

    const search =
        $("studentSearch")?.value
            .trim()
            .toLowerCase() || "";

    const course =
        $("studentCourseFilter")?.value || "";


    const filtered =
        students.filter(student => {

            const matchesSearch =
                !search ||
                student.name.toLowerCase().includes(search) ||
                student.registrationNumber.toLowerCase().includes(search);

            const matchesCourse =
                !course ||
                student.course === course;

            return matchesSearch && matchesCourse;

        });


    const tbody =
        $("studentsTable");

    if (!filtered.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:35px;color:#64748b">
                    No students found.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        filtered.map(student => {

            const due =
                Math.max(
                    0,
                    Number(student.totalFees || 0) -
                    Number(student.feesPaid || 0)
                );

            return `

                <tr>

                    <td>

                        <div class="student-cell">

                            <div class="student-avatar">
                                ${escapeHTML(
                                    student.name
                                        .charAt(0)
                                        .toUpperCase()
                                )}
                            </div>

                            <div>
                                <strong>
                                    ${escapeHTML(student.name)}
                                </strong>

                                <small>
                                    ${escapeHTML(student.phone || "")}
                                </small>
                            </div>

                        </div>

                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(student.registrationNumber)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(student.gender)}
                    </td>

                    <td>
                        ${escapeHTML(student.course)}
                    </td>

                    <td>

                        ${
                            due > 0
                                ? `<span class="badge due">
                                    ${money(due)}
                                   </span>`
                                : `<span class="badge active">
                                    Paid
                                   </span>`
                        }

                    </td>

                    <td>
                        <span class="badge ${
                            student.status === "Active"
                                ? "active"
                                : "inactive"
                        }">
                            ${escapeHTML(student.status)}
                        </span>
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="action-btn edit"
                                onclick="openStudentModal('${student.id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="action-btn delete"
                                onclick="deleteStudent('${student.id}')"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


function deleteStudent(id) {

    const student =
        students.find(s => s.id === id);

    if (!student) return;


    if (
        !confirm(
            `Delete ${student.name}? This cannot be undone.`
        )
    ) {
        return;
    }


    students =
        students.filter(s => s.id !== id);


    Object.keys(attendance).forEach(date => {

        if (attendance[date]) {
            delete attendance[date][id];
        }

    });


    messages =
        messages.filter(
            message =>
                message.studentId !== id
        );


    saveAll();

    renderStudents();

    refreshAdminDashboard();

    showToast("Student deleted.");

}


/* ================= RECENT STUDENTS ================= */

function renderRecentStudents() {

    const container =
        $("recentStudents");

    const recent =
        [...students]
            .reverse()
            .slice(0, 5);


    if (!recent.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No students registered yet.
            </p>`;

        return;

    }


    container.innerHTML =
        recent.map(student => `

            <div class="attendance-row">

                <div class="student-cell">

                    <div class="student-avatar">
                        ${escapeHTML(
                            student.name
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(student.name)}
                        </strong>

                        <small>
                            ${escapeHTML(
                                student.registrationNumber
                            )}
                        </small>

                    </div>

                </div>

                <span class="badge active">
                    ${escapeHTML(student.course)}
                </span>

            </div>

        `).join("");

}


/* ================= ATTENDANCE ================= */

function renderAttendance() {

    const input =
        $("attendanceDate");

    if (!input.value) {

        input.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    const date =
        input.value;

    if (!attendance[date]) {
        attendance[date] = {};
    }


    const container =
        $("attendanceList");


    if (!students.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No students registered.
            </p>`;

        return;

    }


    container.innerHTML =
        students.map(student => {

            const status =
                attendance[date][student.id];


            return `

                <div class="attendance-row">

                    <div>

                        <strong>
                            ${escapeHTML(student.name)}
                        </strong>

                        <small>
                            ${escapeHTML(
                                student.registrationNumber
                            )}
                        </small>

                    </div>


                    <div class="attendance-buttons">

                        <button
                            class="present-btn"
                            onclick="setAttendance(
                                '${student.id}',
                                '${date}',
                                'present'
                            )"
                        >
                            ✓ Present
                        </button>

                        <button
                            class="absent-btn"
                            onclick="setAttendance(
                                '${student.id}',
                                '${date}',
                                'absent'
                            )"
                        >
                            ✕ Absent
                        </button>

                        ${
                            status
                                ? `<strong style="margin-left:8px">
                                    ${status}
                                   </strong>`
                                : ""
                        }

                    </div>

                </div>

            `;

        }).join("");

}


function setAttendance(studentId, date, status) {

    if (!attendance[date]) {
        attendance[date] = {};
    }

    attendance[date][studentId] =
        status;

    saveAll();

    renderAttendance();

    refreshAdminDashboard();

}


/* ================= FEES ================= */

function renderFees() {

    const tbody =
        $("feesTable");


    if (!students.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:30px">
                    No students found.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        students.map(student => {

            const total =
                Number(student.totalFees || 0);

            const paid =
                Number(student.feesPaid || 0);

            const due =
                Math.max(0, total - paid);


            return `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(student.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            student.registrationNumber
                        )}
                    </td>

                    <td>
                        ${money(total)}
                    </td>

                    <td>
                        ${money(paid)}
                    </td>

                    <td>

                        <span class="badge ${
                            due > 0
                                ? "due"
                                : "active"
                        }">

                            ${money(due)}

                        </span>

                    </td>

                    <td>

                        <button
                            class="action-btn edit"
                            onclick="editFees('${student.id}')"
                        >
                            Update
                        </button>

                    </td>

                </tr>

            `;

        }).join("");

}


function editFees(id) {

    const student =
        students.find(s => s.id === id);

    if (!student) return;


    const total =
        prompt(
            "Total fees:",
            student.totalFees || 0
        );

    if (total === null) return;


    const paid =
        prompt(
            "Fees paid:",
            student.feesPaid || 0
        );

    if (paid === null) return;


    student.totalFees =
        Number(total);

    student.feesPaid =
        Number(paid);


    saveAll();

    renderFees();

    refreshAdminDashboard();

    showToast("Fees updated.");

}


/* ================= NOTICES ================= */

function createNotice() {

    const title =
        $("noticeTitle").value.trim();

    const text =
        $("noticeText").value.trim();


    if (!title || !text) {

        showToast("Enter notice title and message.");

        return;

    }


    notices.push({

        id: generateId(),

        title,

        text,

        date:
            new Date().toISOString()

    });


    saveAll();


    $("noticeTitle").value = "";
    $("noticeText").value = "";


    renderAdminNotices();
    refreshAdminDashboard();

    showToast("Notice published.");

}


function renderAdminNotices() {

    const container =
        $("adminNoticeList");


    if (!notices.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No notices published.
            </p>`;

        return;

    }


    container.innerHTML =
        [...notices]
            .reverse()
            .map(notice => `

                <div class="notice-card">

                    <div class="card-meta">
                        ${formatDate(notice.date)}
                    </div>

                    <h3>
                        ${escapeHTML(notice.title)}
                    </h3>

                    <p>
                        ${escapeHTML(notice.text)}
                    </p>

                    <button
                        class="delete-link"
                        onclick="deleteNotice('${notice.id}')"
                    >
                        Delete notice
                    </button>

                </div>

            `).join("");

}


function deleteNotice(id) {

    notices =
        notices.filter(
            notice => notice.id !== id
        );

    saveAll();

    renderAdminNotices();
    refreshAdminDashboard();

    showToast("Notice deleted.");

}


function renderRecentNotices() {

    const container =
        $("recentNotices");


    if (!notices.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No notices.
            </p>`;

        return;

    }


    container.innerHTML =
        [...notices]
            .reverse()
            .slice(0, 4)
            .map(notice => `

                <div class="notice-card">

                    <div class="card-meta">
                        ${formatDate(notice.date)}
                    </div>

                    <h3>
                        ${escapeHTML(notice.title)}
                    </h3>

                    <p>
                        ${escapeHTML(
                            notice.text.substring(0, 130)
                        )}
                    </p>

                </div>

            `).join("");

}


/* ================= BLOG ================= */

function createBlog() {

    const title =
        $("blogTitle").value.trim();

    const author =
        $("blogAuthor").value.trim() ||
        "TeraByte Computer Academy";

    const text =
        $("blogText").value.trim();


    if (!title || !text) {

        showToast("Enter blog title and content.");

        return;

    }


    blogs.push({

        id: generateId(),

        title,

        author,

        text,

        date:
            new Date().toISOString()

    });


    saveAll();


    $("blogTitle").value = "";
    $("blogAuthor").value = "";
    $("blogText").value = "";


    renderAdminBlogs();

    showToast("Blog published.");

}


function renderAdminBlogs() {

    const container =
        $("adminBlogList");


    if (!blogs.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No blogs published.
            </p>`;

        return;

    }


    container.innerHTML =
        [...blogs]
            .reverse()
            .map(blog => `

                <div class="blog-card">

                    <div class="card-meta">

                        ${escapeHTML(blog.author)}
                        •
                        ${formatDate(blog.date)}

                    </div>

                    <h3>
                        ${escapeHTML(blog.title)}
                    </h3>

                    <p>
                        ${escapeHTML(blog.text)}
                    </p>

                    <button
                        class="delete-link"
                        onclick="deleteBlog('${blog.id}')"
                    >
                        Delete blog
                    </button>

                </div>

            `).join("");

}


function deleteBlog(id) {

    blogs =
        blogs.filter(
            blog => blog.id !== id
        );

    saveAll();

    renderAdminBlogs();

    showToast("Blog deleted.");

}


/* ================= MESSAGES ================= */

function populateMessageStudents() {

    const select =
        $("messageStudent");


    select.innerHTML = `
        <option value="all">
            All Students
        </option>
    `;


    students.forEach(student => {

        select.innerHTML += `

            <option value="${student.id}">
                ${escapeHTML(student.name)}
                (${escapeHTML(student.registrationNumber)})
            </option>

        `;

    });

}


function sendMessage() {

    const studentId =
        $("messageStudent").value;

    const title =
        $("messageTitle").value.trim();

    const text =
        $("messageText").value.trim();


    if (!title || !text) {

        showToast("Enter subject and message.");

        return;

    }


    messages.push({

        id: generateId(),

        studentId,

        title,

        text,

        date:
            new Date().toISOString()

    });


    saveAll();


    $("messageTitle").value = "";
    $("messageText").value = "";


    renderAdminMessages();

    showToast("Message sent.");

}


function renderAdminMessages() {

    populateMessageStudents();

    const container =
        $("adminMessageList");


    if (!messages.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No messages sent.
            </p>`;

        return;

    }


    container.innerHTML =
        [...messages]
            .reverse()
            .map(message => {

                const recipient =
                    message.studentId === "all"
                        ? "All Students"
                        : (
                            students.find(
                                s =>
                                    s.id ===
                                    message.studentId
                            )?.name ||
                            "Deleted Student"
                        );


                return `

                    <div class="message-card">

                        <div class="card-meta">

                            To:
                            ${escapeHTML(recipient)}
                            •
                            ${formatDate(message.date)}

                        </div>

                        <h3>
                            ${escapeHTML(message.title)}
                        </h3>

                        <p>
                            ${escapeHTML(message.text)}
                        </p>

                    </div>

                `;

            }).join("");

}


/* ================= STUDENT DASHBOARD ================= */

function refreshStudentDashboard() {

    const student =
        getCurrentStudent();

    if (!student) return;


    $("studentReg").textContent =
        student.registrationNumber;


    const due =
        Math.max(
            0,
            Number(student.totalFees || 0) -
            Number(student.feesPaid || 0)
        );


    $("studentDue").textContent =
        money(due);


    const attendanceData =
        calculateAttendance(student.id);


    $("studentAttendance").textContent =
        attendanceData.percentage + "%";


    $("studentNoticeCount").textContent =
        notices.length;


    renderStudentRecentNotices();
    renderStudentRecentMessages();

}


function calculateAttendance(studentId) {

    let present = 0;
    let total = 0;


    Object.values(attendance)
        .forEach(day => {

            if (
                day &&
                day[studentId]
            ) {

                total++;

                if (
                    day[studentId] ===
                    "present"
                ) {
                    present++;
                }

            }

        });


    const percentage =
        total
            ? Math.round(
                (present / total) * 100
            )
            : 0;


    return {
        present,
        total,
        percentage
    };

}


/* ================= STUDENT PROFILE ================= */

function renderStudentProfile() {

    const student =
        getCurrentStudent();

    if (!student) return;


    $("studentProfileCard").innerHTML = `

        <div class="panel">

            <div class="profile-grid">

                ${profileField(
                    "Full Name",
                    student.name
                )}

                ${profileField(
                    "Registration Number",
                    student.registrationNumber
                )}

                ${profileField(
                    "Gender",
                    student.gender
                )}

                ${profileField(
                    "Date of Birth",
                    student.dob || "Not provided"
                )}

                ${profileField(
                    "Phone",
                    student.phone || "Not provided"
                )}

                ${profileField(
                    "Email",
                    student.email || "Not provided"
                )}

                ${profileField(
                    "Guardian",
                    student.guardian || "Not provided"
                )}

                ${profileField(
                    "Guardian Phone",
                    student.guardianPhone || "Not provided"
                )}

                ${profileField(
                    "Course",
                    student.course
                )}

                ${profileField(
                    "Batch",
                    student.batch || "Not assigned"
                )}

                ${profileField(
                    "Joining Date",
                    student.joiningDate || "Not provided"
                )}

                ${profileField(
                    "Status",
                    student.status
                )}

            </div>


            <div class="profile-field"
                 style="margin-top:15px">

                <small>Address</small>

                <strong>
                    ${escapeHTML(
                        student.address ||
                        "Not provided"
                    )}
                </strong>

            </div>

        </div>

    `;

}


function profileField(label, value) {

    return `

        <div class="profile-field">

            <small>
                ${escapeHTML(label)}
            </small>

            <strong>
                ${escapeHTML(value || "Not provided")}
            </strong>

        </div>

    `;

}


/* ================= STUDENT ATTENDANCE ================= */

function renderStudentAttendance() {

    const student =
        getCurrentStudent();

    if (!student) return;


    const data =
        calculateAttendance(student.id);


    $("studentAttendanceDetails").innerHTML = `

        <div class="stats-grid">

            <div class="stat-card">

                <div class="stat-icon blue">
                    ✓
                </div>

                <div>

                    <span>Attendance</span>

                    <strong>
                        ${data.percentage}%
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon green">
                    ✓
                </div>

                <div>

                    <span>Present</span>

                    <strong>
                        ${data.present}
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon orange">
                    📅
                </div>

                <div>

                    <span>Marked Days</span>

                    <strong>
                        ${data.total}
                    </strong>

                </div>

            </div>

        </div>


        <div class="panel">

            <h2 style="margin-bottom:15px">
                Attendance History
            </h2>

            ${
                renderStudentAttendanceHistory(
                    student.id
                )
            }

        </div>

    `;

}


function renderStudentAttendanceHistory(studentId) {

    const dates =
        Object.keys(attendance)
            .filter(
                date =>
                    attendance[date] &&
                    attendance[date][studentId]
            )
            .sort()
            .reverse();


    if (!dates.length) {

        return `
            <p style="color:#64748b">
                No attendance records yet.
            </p>
        `;

    }


    return dates.map(date => {

        const status =
            attendance[date][studentId];


        return `

            <div class="attendance-row">

                <strong>
                    ${formatDate(date)}
                </strong>

                <span class="badge ${
                    status === "present"
                        ? "active"
                        : "inactive"
                }">

                    ${
                        status === "present"
                            ? "Present"
                            : "Absent"
                    }

                </span>

            </div>

        `;

    }).join("");

}


/* ================= STUDENT FEES ================= */

function renderStudentFees() {

    const student =
        getCurrentStudent();

    if (!student) return;


    const total =
        Number(student.totalFees || 0);

    const paid =
        Number(student.feesPaid || 0);

    const due =
        Math.max(0, total - paid);


    $("studentFeesDetails").innerHTML = `

        <div class="stats-grid">

            <div class="stat-card">

                <div class="stat-icon blue">
                    ₹
                </div>

                <div>

                    <span>Total Fees</span>

                    <strong>
                        ${money(total)}
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon green">
                    ✓
                </div>

                <div>

                    <span>Paid</span>

                    <strong>
                        ${money(paid)}
                    </strong>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon orange">
                    ₹
                </div>

                <div>

                    <span>Due</span>

                    <strong>
                        ${money(due)}
                    </strong>

                </div>

            </div>

        </div>


        <div class="panel">

            <h2>Fee Summary</h2>

            <div class="attendance-row">
                <span>Total Course Fees</span>
                <strong>${money(total)}</strong>
            </div>

            <div class="attendance-row">
                <span>Amount Paid</span>
                <strong>${money(paid)}</strong>
            </div>

            <div class="attendance-row">
                <span>Outstanding Amount</span>
                <strong>${money(due)}</strong>
            </div>

        </div>

    `;

}


/* ================= STUDENT NOTICES ================= */

function renderStudentNotices() {

    const container =
        $("studentNoticeList");


    if (!notices.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No notices available.
            </p>`;

        return;

    }


    container.innerHTML =
        [...notices]
            .reverse()
            .map(notice => `

                <div class="notice-card">

                    <div class="card-meta">
                        ${formatDate(notice.date)}
                    </div>

                    <h3>
                        ${escapeHTML(notice.title)}
                    </h3>

                    <p>
                        ${escapeHTML(notice.text)}
                    </p>

                </div>

            `).join("");

}


function renderStudentRecentNotices() {

    const container =
        $("studentRecentNotices");


    const latest =
        [...notices]
            .reverse()
            .slice(0, 3);


    if (!latest.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No notices.
            </p>`;

        return;

    }


    container.innerHTML =
        latest.map(notice => `

            <div class="notice-card">

                <div class="card-meta">
                    ${formatDate(notice.date)}
                </div>

                <h3>
                    ${escapeHTML(notice.title)}
                </h3>

                <p>
                    ${escapeHTML(
                        notice.text.substring(0, 130)
                    )}
                </p>

            </div>

        `).join("");

}


/* ================= STUDENT BLOGS ================= */

function renderStudentBlogs() {

    const container =
        $("studentBlogList");


    if (!blogs.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No blogs published.
            </p>`;

        return;

    }


    container.innerHTML =
        [...blogs]
            .reverse()
            .map(blog => `

                <div class="blog-card">

                    <div class="card-meta">

                        ${escapeHTML(blog.author)}
                        •
                        ${formatDate(blog.date)}

                    </div>

                    <h3>
                        ${escapeHTML(blog.title)}
                    </h3>

                    <p>
                        ${escapeHTML(blog.text)}
                    </p>

                </div>

            `).join("");

}


/* ================= STUDENT MESSAGES ================= */

function getStudentMessages() {

    const student =
        getCurrentStudent();

    if (!student) return [];


    return messages.filter(
        message =>
            message.studentId === "all" ||
            message.studentId === student.id
    );

}


function renderStudentMessages() {

    const container =
        $("studentMessageList");


    const data =
        [...getStudentMessages()]
            .reverse();


    if (!data.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No messages.
            </p>`;

        return;

    }


    container.innerHTML =
        data.map(message => `

            <div class="message-card">

                <div class="card-meta">
                    ${formatDate(message.date)}
                </div>

                <h3>
                    ${escapeHTML(message.title)}
                </h3>

                <p>
                    ${escapeHTML(message.text)}
                </p>

            </div>

        `).join("");

}


function renderStudentRecentMessages() {

    const container =
        $("studentRecentMessages");


    const data =
        [...getStudentMessages()]
            .reverse()
            .slice(0, 3);


    if (!data.length) {

        container.innerHTML =
            `<p style="color:#64748b">
                No messages.
            </p>`;

        return;

    }


    container.innerHTML =
        data.map(message => `

            <div class="message-card">

                <div class="card-meta">
                    ${formatDate(message.date)}
                </div>

                <h3>
                    ${escapeHTML(message.title)}
                </h3>

                <p>
                    ${escapeHTML(
                        message.text.substring(0, 120)
                    )}
                </p>

            </div>

        `).join("");

}


/* ================= PASSWORD ================= */

function changeStudentPassword() {

    const student =
        getCurrentStudent();

    if (!student) return;


    const current =
        $("currentPassword").value;

    const newPassword =
        $("newPassword").value;

    const confirmPassword =
        $("confirmPassword").value;


    if (current !== student.password) {

        $("passwordMessage").textContent =
            "Current password is incorrect.";

        $("passwordMessage").style.color =
            "#dc2626";

        return;

    }


    if (!newPassword ||
        newPassword.length < 6) {

        $("passwordMessage").textContent =
            "New password must contain at least 6 characters.";

        $("passwordMessage").style.color =
            "#dc2626";

        return;

    }


    if (newPassword !== confirmPassword) {

        $("passwordMessage").textContent =
            "Passwords do not match.";

        $("passwordMessage").style.color =
            "#dc2626";

        return;

    }


    student.password =
        newPassword;


    saveAll();


    $("currentPassword").value = "";
    $("newPassword").value = "";
    $("confirmPassword").value = "";


    $("passwordMessage").textContent =
        "Password changed successfully.";

    $("passwordMessage").style.color =
        "#16a34a";

}


/* ================= ADMIN SETTINGS ================= */

function saveSettings() {

    settings.academyName =
        $("academyName").value.trim() ||
        "TeraByte Computer Academy";


    saveAll();

    showToast("Settings saved.");

}


/* ================= DATE ================= */

function formatDate(value) {

    if (!value) return "";

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {

        return value;

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ================= MOBILE SIDEBAR ================= */

function toggleSidebar() {

    $("adminNavigation")
        .parentElement
        .classList.toggle("open");

}


/* ================= INITIALIZE ================= */

function initialize() {

    if (currentUser) {

        openApplication();

    }

    populateMessageStudents();

}


initialize();