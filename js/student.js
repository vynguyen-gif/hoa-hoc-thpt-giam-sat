/**
 * LOGIC GIAO DIỆN HỌC SINH - BÀI KIỂM TRA THƯỜNG XUYÊN HÓA 11 (MÃ ĐỀ 1101)
 * Hệ thống giám sát trực tiếp & tự động chấm điểm kết nối Thầy Nguyễn Vỹ
 */

document.addEventListener("DOMContentLoaded", () => {
    const bus = new ChemSyncChannel("student");
    const students = bus.getStudents();
    const assignment = CHEM_DATA.assignments[0];
    const questions = assignment.questions || [];

    // 1. Xác định học sinh từ URL query (?id=1101) hoặc mặc định học sinh đầu tiên
    const urlParams = new URLSearchParams(window.location.search);
    let currentStudentId = urlParams.get("id") || "1101";
    let currentStudent = bus.getStudentById(currentStudentId) || students[0];

    // Khởi tạo trạng thái
    let studentAnswers = currentStudent.answers || {};
    let leaveCount = currentStudent.leaveCount || 0;
    let integrity = currentStudent.integrity || 100;
    let isExamSubmitted = currentStudent.submitted || false;

    // 2. Điền danh sách học sinh vào dropdown
    const selectStudentUser = document.getElementById("selectStudentUser");
    if (selectStudentUser) {
        selectStudentUser.innerHTML = students.map(s => `
            <option value="${s.id}" ${s.id === currentStudentId ? 'selected' : ''}>${s.id} - ${s.name} (${s.class})</option>
        `).join("");

        selectStudentUser.addEventListener("change", (e) => {
            window.location.href = `student.html?id=${e.target.value}`;
        });
    }

    // 3. Cập nhật header học sinh
    function updateStudentHeader() {
        document.getElementById("studentDisplayName").textContent = currentStudent.name;
        document.getElementById("studentDisplayId").textContent = currentStudent.id;
        document.getElementById("studentDisplayClass").textContent = currentStudent.class;
        updateIntegrityUI();
    }

    function updateIntegrityUI() {
        const pill = document.getElementById("studentIntegrityPill");
        const text = document.getElementById("studentIntegrityText");
        const sidebarCount = document.getElementById("sidebarLeaveCount");

        text.textContent = `Tập trung: ${integrity}%`;
        if (sidebarCount) sidebarCount.textContent = `${leaveCount} lần`;

        if (integrity < 80) {
            pill.className = "integrity-pill warning";
        } else {
            pill.className = "integrity-pill";
        }
    }

    // 4. Phát tín hiệu đăng nhập vào phòng thi
    bus.updateStudent(currentStudent.id, {
        online: true,
        status: isExamSubmitted ? "Đã nộp bài" : "Đang làm bài...",
        lastActive: "Vừa vào phòng thi"
    });

    bus.send("STUDENT_LOGIN", {
        id: currentStudent.id,
        name: currentStudent.name,
        class: currentStudent.class
    });

    // 5. Render toàn bộ 20 câu hỏi trắc nghiệm
    const questionsContainer = document.getElementById("questionsListContainer");
    const paletteGrid = document.getElementById("questionPaletteGrid");

    if (questionsContainer) {
        questionsContainer.innerHTML = questions.map((q, idx) => {
            const savedAns = studentAnswers[q.id];
            return `
                <div class="question-card" id="q-card-${q.id}">
                    <div class="question-title">${q.title} (${q.points} điểm)</div>
                    <div class="question-text">${q.text}</div>
                    <div class="mcq-options-list">
                        ${q.options.map((opt, optIdx) => `
                            <label class="mcq-option-item ${savedAns === optIdx ? 'selected' : ''}" onclick="selectMcqOption(${q.id}, ${optIdx})">
                                <input type="radio" name="question_${q.id}" value="${optIdx}" ${savedAns === optIdx ? 'checked' : ''}>
                                ${opt}
                            </label>
                        `).join("")}
                    </div>
                </div>
            `;
        }).join("");
    }

    // Render palette 20 câu hỏi bên cột phải
    if (paletteGrid) {
        paletteGrid.innerHTML = questions.map(q => `
            <button type="button" class="palette-btn ${studentAnswers[q.id] !== undefined ? 'answered' : ''}" 
                id="pal-btn-${q.id}" onclick="scrollToQuestion(${q.id})">
                Câu ${q.id}
            </button>
        `).join("");
    }

    // 6. Xử lý khi học sinh chọn đáp án
    window.selectMcqOption = function(qId, optionIndex) {
        if (isExamSubmitted) return;

        studentAnswers[qId] = optionIndex;

        // Cập nhật giao diện câu hỏi
        const card = document.getElementById(`q-card-${qId}`);
        if (card) {
            card.querySelectorAll(".mcq-option-item").forEach(item => item.classList.remove("selected"));
            const targetRadio = card.querySelector(`input[value="${optionIndex}"]`);
            if (targetRadio) {
                targetRadio.checked = true;
                targetRadio.closest(".mcq-option-item").classList.add("selected");
            }
        }

        // Cập nhật palette
        const palBtn = document.getElementById(`pal-btn-${qId}`);
        if (palBtn) palBtn.classList.add("answered");

        updateProgressUI();

        // Đồng bộ thời gian thực sang Thầy Vỹ
        const answeredCount = Object.keys(studentAnswers).length;
        const progressStr = `${answeredCount}/${questions.length} câu • ${Math.round(answeredCount / questions.length * 100)}%`;
        const optionLetters = ["A", "B", "C", "D"];

        bus.send("STUDENT_TYPING", {
            id: currentStudent.id,
            name: currentStudent.name,
            answeredCount: answeredCount,
            progress: progressStr,
            text: `Vừa chọn đáp án ${optionLetters[optionIndex]} cho Câu ${qId} (Đã làm: ${progressStr})`
        });
    };

    function updateProgressUI() {
        const answeredCount = Object.keys(studentAnswers).length;
        const total = questions.length;
        const percent = Math.round((answeredCount / total) * 100);

        const answeredCountEl = document.getElementById("answeredCount");
        const progressPercentEl = document.getElementById("progressPercent");

        if (answeredCountEl) answeredCountEl.textContent = `${answeredCount} / ${total} câu`;
        if (progressPercentEl) progressPercentEl.textContent = `${percent}%`;
    }

    window.scrollToQuestion = function(qId) {
        const el = document.getElementById(`q-card-${qId}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    // 7. Âm thanh cảnh báo (Web Audio API)
    function playBeepAlarm() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(850, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
    }

    // 8. Hệ thống chống gian lận - Phát hiện rời tab
    let isTabCurrentlyHidden = false;

    function handleStudentLeave() {
        if (isExamSubmitted) return;
        if (isTabCurrentlyHidden) return;

        isTabCurrentlyHidden = true;
        leaveCount++;
        integrity = Math.max(20, 100 - leaveCount * 10);

        playBeepAlarm();

        bus.send("STUDENT_LEAVE_TAB", {
            id: currentStudent.id,
            name: currentStudent.name,
            leaveCount: leaveCount,
            integrity: integrity,
            reason: "Rời màn hình bài thi / Chuyển sang ứng dụng khác"
        });

        updateIntegrityUI();
    }

    function handleStudentReturn() {
        if (isExamSubmitted) return;
        if (!isTabCurrentlyHidden) return;

        isTabCurrentlyHidden = false;

        const cheatModal = document.getElementById("studentCheatModal");
        const violationBox = document.getElementById("cheatViolationBox");
        if (violationBox) {
            violationBox.textContent = `Số lần vi phạm: ${leaveCount} lần • Chỉ số liêm chính giảm còn ${integrity}%`;
        }
        if (cheatModal) cheatModal.classList.add("active");

        playBeepAlarm();
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) handleStudentLeave();
        else handleStudentReturn();
    });

    window.addEventListener("blur", () => handleStudentLeave());
    window.addEventListener("focus", () => handleStudentReturn());

    const btnAcknowledgeCheat = document.getElementById("btnAcknowledgeCheat");
    if (btnAcknowledgeCheat) {
        btnAcknowledgeCheat.addEventListener("click", () => {
            document.getElementById("studentCheatModal").classList.remove("active");
            bus.send("STUDENT_RETURN_TAB", {
                id: currentStudent.id,
                name: currentStudent.name
            });
        });
    }

    // 9. Đồng hồ đếm ngược 20 phút (1200 giây)
    let remainingSeconds = 20 * 60;
    const timerText = document.getElementById("timerText");

    const timerInterval = setInterval(() => {
        if (remainingSeconds <= 0 || isExamSubmitted) {
            clearInterval(timerInterval);
            if (remainingSeconds <= 0 && !isExamSubmitted) {
                alert("Hết giờ làm bài! Hệ thống tự động thu bài của em.");
                submitStudentExam();
            }
            return;
        }
        remainingSeconds--;
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        if (timerText) {
            timerText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }, 1000);

    // 10. Xử lý nộp bài thi
    function submitStudentExam() {
        isExamSubmitted = true;

        // Tính điểm tự động: 0.5 điểm mỗi câu đúng
        let correctCount = 0;
        questions.forEach(q => {
            if (studentAnswers[q.id] === q.correct) {
                correctCount++;
            }
        });

        let finalScore = Math.round(correctCount * 0.5 * 10) / 10;
        const answeredCount = Object.keys(studentAnswers).length;

        // Gửi kết quả về máy Thầy Nguyễn Vỹ
        bus.send("STUDENT_SUBMIT", {
            id: currentStudent.id,
            name: currentStudent.name,
            class: currentStudent.class,
            score: finalScore,
            correctCount: correctCount,
            totalQuestions: questions.length,
            feedback: `Đúng ${correctCount}/${questions.length} câu (${finalScore} điểm). Vi phạm rời tab: ${leaveCount} lần.`,
            answers: studentAnswers
        });

        alert(`🎉 Chúc mừng ${currentStudent.name}!\n\nEm đã hoàn thành bài kiểm tra Hóa 11 - Mã đề 1101!\n- Số câu đúng: ${correctCount} / ${questions.length} câu\n- Điểm số: ${finalScore} / 10.0 điểm\n- Kết quả đã được chuyển ngay đến Thầy Nguyễn Vỹ.`);

        const submitBtn = document.getElementById("btnSubmitExam");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = `✅ ĐÃ NỘP BÀI: ${finalScore} ĐIỂM`;
            submitBtn.style.background = "#16a34a";
        }
    }

    const btnSubmitExam = document.getElementById("btnSubmitExam");
    if (btnSubmitExam) {
        btnSubmitExam.addEventListener("click", () => {
            const answeredCount = Object.keys(studentAnswers).length;
            const unanswered = questions.length - answeredCount;

            let confirmMsg = `Em có chắc chắn muốn nộp bài kiểm tra Hóa học 11 này không?`;
            if (unanswered > 0) {
                confirmMsg = `Em còn ${unanswered} câu chưa trả lời. Em có chắc chắn muốn nộp bài ngay không?`;
            }

            if (confirm(confirmMsg)) {
                submitStudentExam();
            }
        });
    }

    // Nhận cảnh báo từ giáo viên
    bus.on("TEACHER_ALERT", (payload) => {
        if (payload.studentId === String(currentStudent.id)) {
            playBeepAlarm();
            alert(`🚨 THẦY NGUYỄN VỸ NHẮC NHỞ:\n\n"${payload.message}"`);
        }
    });

    bus.on("TEACHER_REOPEN", () => {
        isExamSubmitted = false;
        const submitBtn = document.getElementById("btnSubmitExam");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Nộp Bài Kiểm Tra";
            submitBtn.style.background = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
        }
        alert("Thầy Nguyễn Vỹ đã mở lại quyền làm bài cho cả lớp!");
    });

    // Khởi tạo
    updateStudentHeader();
    updateProgressUI();
});
