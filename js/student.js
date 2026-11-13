/**
 * LOGIC GIAO DIỆN HỌC SINH - LÀM BÀI HÓA HỌC 12 KNTT
 * Hệ thống chống gian lận & giám sát thời gian thực kết nối với Thầy Nguyễn Vỹ
 */

document.addEventListener("DOMContentLoaded", () => {
    const bus = new ChemSyncChannel("student");
    const students = bus.getStudents();

    // 1. Xác định học sinh hiện tại từ URL query hoặc mặc định là Nguyễn Minh An (1101)
    const urlParams = new URLSearchParams(window.location.search);
    let currentStudentId = urlParams.get("id") || "1101";

    let currentStudent = bus.getStudentById(currentStudentId) || students[0];

    // Khởi tạo trạng thái câu trả lời
    let studentAnswers = currentStudent.answers || {};
    let leaveCount = currentStudent.leaveCount || 0;
    let integrity = currentStudent.integrity || 100;
    let isExamSubmitted = currentStudent.submitted || false;

    // 2. Điền danh sách chọn học sinh để test mô phỏng
    const selectStudentUser = document.getElementById("selectStudentUser");
    if (selectStudentUser) {
        selectStudentUser.innerHTML = students.map(s => `
            <option value="${s.id}" ${s.id === currentStudentId ? 'selected' : ''}>${s.id} - ${s.name} (${s.class})</option>
        `).join("");

        selectStudentUser.addEventListener("change", (e) => {
            window.location.href = `student.html?id=${e.target.value}`;
        });
    }

    // 3. Cập nhật thông tin học sinh lên giao diện
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
        sidebarCount.textContent = `${leaveCount} lần`;

        if (integrity < 80) {
            pill.className = "integrity-pill warning";
        } else {
            pill.className = "integrity-pill";
        }
    }

    // 4. Phát thông báo học sinh đăng nhập vào phòng thi
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

    // 5. Khôi phục bài làm nếu đã có dữ liệu trước đó
    const essayTextarea = document.getElementById("essayInput");
    if (currentStudent.liveCode) {
        essayTextarea.value = currentStudent.liveCode;
        updateCharCounter();
    }

    // Khôi phục đáp án trắc nghiệm nếu đã chọn
    if (studentAnswers[1] !== undefined) {
        const radio = document.querySelector(`input[name="question_1"][value="${studentAnswers[1]}"]`);
        if (radio) { radio.checked = true; radio.closest('.mcq-option-item').classList.add('selected'); }
    }
    if (studentAnswers[2] !== undefined) {
        const radio = document.querySelector(`input[name="question_2"][value="${studentAnswers[2]}"]`);
        if (radio) { radio.checked = true; radio.closest('.mcq-option-item').classList.add('selected'); }
    }
    if (studentAnswers[3] !== undefined) {
        const radio = document.querySelector(`input[name="question_3"][value="${studentAnswers[3]}"]`);
        if (radio) { radio.checked = true; radio.closest('.mcq-option-item').classList.add('selected'); }
    }
    if (studentAnswers[4] !== undefined) {
        const radio = document.querySelector(`input[name="question_4"][value="${studentAnswers[4]}"]`);
        if (radio) { radio.checked = true; radio.closest('.mcq-option-item').classList.add('selected'); }
    }
    updatePaletteStatus();

    // 6. Âm thanh cảnh báo (Web Audio API Synthesizer)
    function playBeepAlarm() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {
            console.warn("Audio Context not supported");
        }
    }

    // =========================================================================
    // HỆ THỐNG PHÁT HIỆN RỜI TAB & GIAN LẬN THỜI GIAN THỰC (ANTI-CHEAT DETECTOR)
    // =========================================================================
    let isTabCurrentlyHidden = false;

    function handleStudentLeave() {
        if (isExamSubmitted) return;
        if (isTabCurrentlyHidden) return; // tránh trùng lặp giữa blur và visibilitychange

        isTabCurrentlyHidden = true;
        leaveCount++;
        integrity = Math.max(20, 100 - leaveCount * 10);

        playBeepAlarm();

        // Gửi ngay lập tức sang máy Thầy Nguyễn Vỹ
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

        // Hiển thị modal cảnh báo trên màn hình học sinh
        const cheatModal = document.getElementById("studentCheatModal");
        const violationBox = document.getElementById("cheatViolationBox");
        violationBox.textContent = `Số lần vi phạm: ${leaveCount} lần • Chỉ số liêm chính giảm còn ${integrity}%`;
        cheatModal.classList.add("active");

        playBeepAlarm();
    }

    // Lắng nghe sự kiện rời tab (Visibility API)
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            handleStudentLeave();
        } else {
            handleStudentReturn();
        }
    });

    // Lắng nghe mất tiêu điểm cửa sổ
    window.addEventListener("blur", () => {
        handleStudentLeave();
    });

    window.addEventListener("focus", () => {
        handleStudentReturn();
    });

    // Nút xác nhận đã hiểu khi bị cảnh báo
    document.getElementById("btnAcknowledgeCheat").addEventListener("click", () => {
        document.getElementById("studentCheatModal").classList.remove("active");
        bus.send("STUDENT_RETURN_TAB", {
            id: currentStudent.id,
            name: currentStudent.name
        });
    });

    // =========================================================================
    // THEO DÕI GÕ BÀI VÀ THAO TÁC TRẮC NGHIỆM THỜI GIAN THỰC (REALTIME STREAM)
    // =========================================================================
    function updateCharCounter() {
        const text = essayTextarea.value;
        const charCount = text.length;
        const lineCount = text ? text.split("\n").length : 0;
        document.getElementById("charCountDisplay").textContent = `Đang gõ: ${charCount} ký tự • ${lineCount} dòng`;
    }

    let typingTimer = null;
    essayTextarea.addEventListener("input", () => {
        updateCharCounter();
        studentAnswers[6] = essayTextarea.value;
        updatePaletteStatus();

        // Gửi stream trực tiếp sang Thầy Vỹ với debounce nhẹ
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            const text = essayTextarea.value;
            const lineCount = text ? text.split("\n").length : 0;

            bus.send("STUDENT_TYPING", {
                id: currentStudent.id,
                name: currentStudent.name,
                text: text,
                charCount: text.length,
                lineCount: lineCount
            });
        }, 150);
    });

    // Bàn phím ký hiệu hóa học ảo
    window.insertSymbol = function(symbol) {
        const start = essayTextarea.selectionStart;
        const end = essayTextarea.selectionEnd;
        const text = essayTextarea.value;
        essayTextarea.value = text.substring(0, start) + symbol + text.substring(end);
        essayTextarea.selectionStart = essayTextarea.selectionEnd = start + symbol.length;
        essayTextarea.focus();
        essayTextarea.dispatchEvent(new Event("input"));
    };

    // Chọn trắc nghiệm 4 lựa chọn (MCQ)
    window.selectMcqOption = function(qId, optionIndex) {
        studentAnswers[qId] = optionIndex;
        const card = document.getElementById(`q-card-${qId}`);
        if (card) {
            card.querySelectorAll(".mcq-option-item").forEach(item => item.classList.remove("selected"));
            const targetRadio = card.querySelector(`input[value="${optionIndex}"]`);
            if (targetRadio) {
                targetRadio.checked = true;
                targetRadio.closest(".mcq-option-item").classList.add("selected");
            }
        }
        updatePaletteStatus();

        bus.send("STUDENT_TYPING", {
            id: currentStudent.id,
            name: currentStudent.name,
            text: essayTextarea.value || `Đã chọn đáp án Câu ${qId}`,
            charCount: essayTextarea.value.length,
            lineCount: 1
        });
    };

    // Chọn Đúng/Sai cho câu 5
    window.selectTFOption = function(subId, isTrue) {
        studentAnswers[subId] = isTrue;
        updatePaletteStatus();
    };

    // Cập nhật bảng palette câu hỏi bên phải
    function updatePaletteStatus() {
        let count = 0;
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`pal-btn-${i}`);
            if (studentAnswers[i] !== undefined) {
                btn.classList.add("answered");
                count++;
            } else {
                btn.classList.remove("answered");
            }
        }

        // Câu 5
        const q5Done = ['5a', '5b', '5c', '5d'].some(k => studentAnswers[k] !== undefined);
        const btn5 = document.getElementById("pal-btn-5");
        if (q5Done) { btn5.classList.add("answered"); count++; }
        else { btn5.classList.remove("answered"); }

        // Câu 6
        const btn6 = document.getElementById("pal-btn-6");
        if (essayTextarea.value.trim().length > 0) {
            btn6.classList.add("answered");
            count++;
        } else {
            btn6.classList.remove("answered");
        }

        document.getElementById("answeredCount").textContent = `${count} / 6`;
    }

    // Cuộn mượt đến câu hỏi
    window.scrollToQuestion = function(num) {
        const el = document.getElementById(`q-card-${num}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    // 7. Đồng hồ đếm ngược bài thi
    let remainingSeconds = 42 * 60 + 15;
    const timerText = document.getElementById("timerText");
    const timerInterval = setInterval(() => {
        if (remainingSeconds <= 0 || isExamSubmitted) {
            clearInterval(timerInterval);
            return;
        }
        remainingSeconds--;
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        timerText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);

    // =========================================================================
    // NỘP BÀI KIỂM TRA
    // =========================================================================
    document.getElementById("btnSubmitExam").addEventListener("click", () => {
        if (isExamSubmitted) {
            alert("Em đã nộp bài thi rồi!");
            return;
        }

        if (confirm("Em có chắc chắn muốn nộp bài kiểm tra Hóa học 12 này cho Thầy Nguyễn Vỹ không?")) {
            isExamSubmitted = true;

            // Tính điểm tự động sơ bộ
            let score = 0;
            // Q1: B (1) -> 1đ
            if (studentAnswers[1] === 1) score += 1.0;
            // Q2: C (2) -> 1đ
            if (studentAnswers[2] === 2) score += 1.0;
            // Q3: A (0) -> 1đ
            if (studentAnswers[3] === 0) score += 1.0;
            // Q4: C (2) -> 1đ
            if (studentAnswers[4] === 2) score += 1.0;

            // Q5: 5a false, 5b true, 5c true, 5d true
            let q5Score = 0;
            if (studentAnswers['5a'] === false) q5Score += 0.5;
            if (studentAnswers['5b'] === true) q5Score += 0.5;
            if (studentAnswers['5c'] === true) q5Score += 0.5;
            if (studentAnswers['5d'] === true) q5Score += 0.5;
            score += q5Score;

            // Tự luận Q6 (tối đa 4đ)
            const essayVal = essayTextarea.value.toLowerCase();
            let essayScore = 1.0;
            if (essayVal.includes("ch3cooc2h5") || essayVal.includes("este")) essayScore += 1.5;
            if (essayVal.includes("thuan nghich") || essayVal.includes("cân bằng") || essayVal.includes("<=>")) essayScore += 1.5;
            score += essayScore;

            // Trừ điểm liêm chính nếu rời tab nhiều
            if (leaveCount >= 3) {
                score = Math.max(1.0, score - 1.0);
            }

            score = Math.round(score * 10) / 10;

            // Gửi dữ liệu nộp bài
            bus.send("STUDENT_SUBMIT", {
                id: currentStudent.id,
                name: currentStudent.name,
                class: currentStudent.class,
                score: score,
                feedback: `Hoàn thành bài thi (Vi phạm rời tab: ${leaveCount} lần).`,
                answers: studentAnswers,
                essayText: essayTextarea.value
            });

            alert(`Chúc mừng ${currentStudent.name}! Em đã nộp bài thi thành công!\nĐiểm số dự kiến: ${score}/10đ\nBài làm và nhật ký phòng thi đã được chuyển đến Thầy Nguyễn Vỹ.`);
            document.getElementById("btnSubmitExam").disabled = true;
            document.getElementById("btnSubmitExam").textContent = "✅ ĐÃ NỘP BÀI THÀNH CÔNG";
            document.getElementById("btnSubmitExam").style.background = "#16a34a";
        }
    });

    // =========================================================================
    // NHẬN CẢNH BÁO TRỰC TIẾP TỪ THẦY NGUYỄN VỸ
    // =========================================================================
    bus.on("TEACHER_ALERT", (payload) => {
        if (payload.studentId === String(currentStudent.id)) {
            playBeepAlarm();
            alert(`🚨 THẦY NGUYỄN VỸ NHẮC NHỞ:\n\n"${payload.message}"`);
        }
    });

    bus.on("TEACHER_REOPEN", () => {
        isExamSubmitted = false;
        document.getElementById("btnSubmitExam").disabled = false;
        document.getElementById("btnSubmitExam").textContent = "Nộp Bài Kiểm Tra";
        document.getElementById("btnSubmitExam").style.background = "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)";
        alert("Thầy Nguyễn Vỹ đã mở lại quyền làm bài cho cả lớp!");
    });

    bus.on("STUDENT_ROSTER_UPDATED", () => {
        const updatedList = bus.getStudents();
        if (selectStudentUser) {
            selectStudentUser.innerHTML = updatedList.map(s => `
                <option value="${s.id}" ${s.id === currentStudentId ? 'selected' : ''}>${s.id} - ${s.name} (${s.class})</option>
            `).join("");
        }
    });

    // Khởi tạo
    updateStudentHeader();
});
