/**
 * LOGIC GIAO DIỆN GIÁO VIÊN - THẦY NGUYỄN VỸ
 * Giám sát trực tiếp học sinh làm bài & Chống gian lận Hóa Học 12 KNTT
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Quản lý trạng thái
    let currentFilterTab = "submitted";
    let currentActiveTab = "tab-live-monitor";
    let currentInspectingStudentId = null;
    let voiceEnabled = false;

    // Khởi tạo kênh realtime
    const bus = new ChemSyncChannel("teacher");

    // Lấy danh sách học sinh
    function getStudents() {
        return bus.getStudents();
    }

    // 2. Cập nhật Thống kê trên đầu trang (Metric Stats)
    function updateMetrics() {
        const students = getStudents();
        const total = students.length;
        const onlineCount = students.filter(s => s.online).length;
        const typingCount = students.filter(s => s.online && (s.status.includes("gõ") || s.status.includes("làm"))).length;
        const leavingCount = students.filter(s => s.warningType === "leaving_now").length;

        document.getElementById("statTotalStudents").textContent = total;
        document.getElementById("statOnlineStudents").innerHTML = `${onlineCount} <small>/ ${total}</small>`;
        document.getElementById("statActiveWriting").textContent = typingCount;
        document.getElementById("statLeavingAlert").innerHTML = `${leavingCount} <small style="color: #dc2626; font-size: 14px;">học sinh</small>`;

        // Cập nhật số liệu trên các chip trạng thái của Tab 4
        const submittedCount = students.filter(s => s.submitted).length;
        const unsubmittedCount = total - submittedCount;
        const gradedCount = students.filter(s => s.graded).length;
        const ungradedCount = submittedCount - gradedCount;
        const leftTabCount = students.filter(s => s.leaveCount > 0).length;

        document.getElementById("chipAllCount").textContent = total;
        document.getElementById("chipSubmittedCount").textContent = submittedCount;
        document.getElementById("chipUnsubmittedCount").textContent = unsubmittedCount;
        document.getElementById("chipGradedCount").textContent = gradedCount;
        document.getElementById("chipUngradedCount").textContent = ungradedCount;
        document.getElementById("chipLeftTabCount").textContent = leftTabCount;
        document.getElementById("reopenCount").textContent = submittedCount;
    }

    // 3. Render Tab 1: Live Cards Grid (Chuẩn xác như Ảnh 1)
    function renderLiveGrid(searchTerm = "") {
        const grid = document.getElementById("studentsLiveGrid");
        if (!grid) return;

        const students = getStudents();
        const term = searchTerm.trim().toLowerCase();

        const filtered = students.filter(s => {
            if (!term) return true;
            return s.name.toLowerCase().includes(term) || s.id.includes(term);
        });

        grid.innerHTML = filtered.map(s => {
            const isOnline = s.online;
            const isLeavingNow = s.warningType === "leaving_now";
            const isLeavingRecent = s.warningType === "left_recent";

            // Warning pill
            let warningHtml = "";
            if (isLeavingNow) {
                warningHtml = `
                    <div class="warning-pill-banner warning-leaving">
                        <i class="fa-solid fa-triangle-exclamation"></i> ${s.warningText || `⚠️ ⚠️ ĐANG RỜI TAB (${s.leaveCount} lần)!`}
                    </div>
                `;
            } else if (isLeavingRecent) {
                warningHtml = `
                    <div class="warning-pill-banner warning-recent">
                        <i class="fa-regular fa-clock"></i> ${s.warningText || `Vừa Rời màn hình (${s.leaveCount})`}
                    </div>
                `;
            }

            // Integrity color
            let integrityClass = "integrity-high";
            if (s.integrity < 70) integrityClass = "integrity-danger";
            else if (s.integrity < 90) integrityClass = "integrity-warn";

            // Status display
            let statusClass = "";
            if (s.status.includes("gõ")) statusClass = "status-typing";

            return `
                <div class="student-card ${isLeavingNow ? 'is-leaving' : ''}" data-student-id="${s.id}">
                    <div>
                        <!-- Header thẻ: Tên + Badge Online/Offline -->
                        <div class="card-top">
                            <span class="student-name-title" title="${s.name}">${s.name}</span>
                            ${isOnline ? '<span class="badge-online">Online</span>' : '<span class="badge-offline">Offline</span>'}
                        </div>

                        <!-- ID & Lớp -->
                        <div class="card-subline">
                            <span class="id-badge">ID: ${s.id}</span>
                            <span>${s.class}</span>
                        </div>

                        <!-- Tên bài thi -->
                        <div class="exam-tag">
                            <i class="fa-solid fa-flask" style="color: #ea580c; font-size: 11px;"></i> ${s.assignment}
                        </div>

                        <!-- Banner cảnh báo nếu có -->
                        ${warningHtml}

                        <!-- Thông tin chi tiết theo thời gian thực -->
                        <div class="card-details-list">
                            <div class="detail-row">
                                <span class="detail-label">Trạng thái:</span>
                                <span class="detail-value ${statusClass}">${s.status}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Thao tác gần nhất:</span>
                                <span class="detail-value">${s.lastActive}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Chỉ số liêm chính:</span>
                                <span class="detail-value ${integrityClass}">${s.integrity}% (${s.leaveCount} lần rời)</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Điểm số:</span>
                                <span class="detail-value" style="font-weight: 700; color: ${s.score !== null ? '#0284c7' : '#94a3b8'};">
                                    ${s.score !== null ? `${s.score}/10` : 'Chưa chấm'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Nút hành động Soi Live & Chấm Điểm -->
                    <button type="button" class="btn-card-action" onclick="openInspectModal('${s.id}')">
                        <i class="fa-regular fa-eye"></i> Soi Live & Chấm Điểm
                    </button>
                </div>
            `;
        }).join("");
    }

    // 4. Render Tab 4: Table View (Chuẩn xác như Ảnh 2)
    function renderSubmissionsTable(filterType = "submitted", searchTerm = "") {
        const tbody = document.getElementById("gradingTableBody");
        if (!tbody) return;

        const students = getStudents();
        const term = searchTerm.trim().toLowerCase();

        let filtered = students.filter(s => {
            if (term && !s.name.toLowerCase().includes(term) && !s.id.includes(term)) {
                return false;
            }
            if (filterType === "all") return true;
            if (filterType === "submitted") return s.submitted;
            if (filterType === "unsubmitted") return !s.submitted;
            if (filterType === "graded") return s.graded;
            if (filterType === "ungraded") return s.submitted && !s.graded;
            if (filterType === "left_tab") return s.leaveCount > 0;
            return true;
        });

        tbody.innerHTML = filtered.map((s, index) => {
            // Điểm số badge
            let scoreBadge = `<span class="badge-score-pill score-medium">Chưa chấm</span>`;
            if (s.score !== null) {
                if (s.score < 5.0) scoreBadge = `<span class="badge-score-pill score-low">${s.score} / 10</span>`;
                else if (s.score < 8.0) scoreBadge = `<span class="badge-score-pill score-medium">${s.score} / 10</span>`;
                else scoreBadge = `<span class="badge-score-pill score-good">${s.score} / 10</span>`;
            }

            return `
                <tr>
                    <td style="text-align: center;">
                        <input type="checkbox" class="student-row-check" value="${s.id}" checked>
                    </td>
                    <td style="color: #64748b; font-weight: 600;">${index + 1}</td>
                    <td class="id-badge">${s.id}</td>
                    <td>
                        <span class="table-student-name">
                            ${s.name}
                            <span class="${s.online ? 'table-dot-online' : 'table-dot-offline'}" title="${s.online ? 'Online' : 'Offline'}"></span>
                        </span>
                    </td>
                    <td>${s.class}</td>
                    <td>${s.assignment}</td>
                    <td style="font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #475569;">${s.submitTime}</td>
                    <td style="font-size: 12.5px; color: #64748b;">${s.sizeProgress}</td>
                    <td>
                        ${s.submitted ? '<span class="badge-submitted">Đã nộp bài</span>' : '<span class="badge-unsubmitted">Chưa nộp</span>'}
                    </td>
                    <td style="text-align: center;">${scoreBadge}</td>
                    <td>
                        <span class="feedback-text-cell" title="${s.feedback || ''}">${s.feedback || 'Chưa có nhận xét'}</span>
                    </td>
                    <td style="text-align: center;">
                        <button class="btn-table-action" style="padding: 4px 10px; font-size: 12px;" onclick="openInspectModal('${s.id}')">
                            <i class="fa-regular fa-eye"></i> Soi
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // Render Tab 2: Quản lý lớp
    function renderRosterTable() {
        const tbody = document.getElementById("rosterTableBody");
        if (!tbody) return;
        const students = getStudents();
        const currentClass = students.length > 0 ? students[0].class : "12C1";
        const headerTitle = document.getElementById("rosterTitleHeader");
        if (headerTitle) {
            headerTitle.textContent = `Danh Sách Học Sinh Lớp ${currentClass} (Hóa Học KNTT - ${students.length} Học Sinh)`;
        }

        tbody.innerHTML = students.map((s, idx) => `
            <tr>
                <td style="color: #64748b; font-weight: 600;">${idx + 1}</td>
                <td class="id-badge">${s.id}</td>
                <td style="font-weight: 700;">${s.name}</td>
                <td>${s.class}</td>
                <td><span class="${s.online ? 'badge-online' : 'badge-offline'}">${s.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</span></td>
                <td><strong style="color: ${s.integrity < 70 ? '#dc2626' : '#16a34a'};">${s.integrity}%</strong> (Vi phạm: ${s.leaveCount} lần)</td>
                <td><strong>${s.score !== null ? `${s.score} đ` : 'Chưa có'}</strong></td>
            </tr>
        `).join("");
    }

    // 5. Modal Soi Live & Chấm Điểm
    window.openInspectModal = function(studentId) {
        currentInspectingStudentId = studentId;
        const student = bus.getStudentById(studentId);
        if (!student) return;

        document.getElementById("modalStudentName").textContent = student.name;
        document.getElementById("modalStudentId").textContent = `ID: ${student.id}`;
        document.getElementById("modalStudentClass").textContent = student.class;
        document.getElementById("modalExamName").textContent = `🧪 ${student.assignment}`;

        // Live text
        document.getElementById("modalLiveCodeContent").textContent = student.liveCode || "(Học sinh chưa nhập câu trả lời...)";
        document.getElementById("modalLastKeyTime").textContent = `Cập nhật: ${student.lastActive}`;

        // Cảnh báo rời tab
        const alertBox = document.getElementById("modalAlertBox");
        if (student.warningType === "leaving_now") {
            alertBox.style.display = "flex";
            document.getElementById("modalAlertText").textContent = `⚠️ ĐANG RỜI TAB KHỎI BÀI THI (${student.leaveCount} LẦN)!`;
        } else {
            alertBox.style.display = "none";
        }

        // Lịch sử rời tab
        document.getElementById("modalIntegrityScore").textContent = `Chỉ số liêm chính: ${student.integrity}% (${student.leaveCount} lần rời)`;
        const historyList = document.getElementById("modalLeaveHistoryList");
        if (student.leaveHistory && student.leaveHistory.length > 0) {
            historyList.innerHTML = student.leaveHistory.map(h => `
                <div class="history-item">
                    <span><i class="fa-solid fa-triangle-exclamation" style="color: #dc2626; margin-right: 6px;"></i> ${h.reason}</span>
                    <span class="history-time">${h.time}</span>
                </div>
            `).join("");
        } else {
            historyList.innerHTML = `<div style="color: #16a34a; font-size: 13px; padding: 6px 0;"><i class="fa-solid fa-check"></i> Học sinh làm bài rất nghiêm túc, chưa rời tab lần nào!</div>`;
        }

        // Điểm số & Lời phê
        document.getElementById("modalInputScore").value = student.score !== null ? student.score : 7.0;
        document.getElementById("modalInputFeedback").value = student.feedback || "Em hoàn thành tốt bài thí nghiệm Hóa học.";

        // Mở modal
        document.getElementById("inspectModal").classList.add("active");
    };

    function closeInspectModal() {
        document.getElementById("inspectModal").classList.remove("active");
        currentInspectingStudentId = null;
    }

    document.getElementById("modalCloseBtn").addEventListener("click", closeInspectModal);
    document.getElementById("modalCloseBtn2").addEventListener("click", closeInspectModal);

    // Lưu Đánh Giá & Điểm số
    document.getElementById("btnSaveGrading").addEventListener("click", () => {
        if (!currentInspectingStudentId) return;
        const newScore = parseFloat(document.getElementById("modalInputScore").value);
        const newFeedback = document.getElementById("modalInputFeedback").value.trim();

        bus.updateStudent(currentInspectingStudentId, {
            score: isNaN(newScore) ? null : newScore,
            feedback: newFeedback,
            graded: true
        });

        bus.send("TEACHER_GRADE", {
            studentId: currentInspectingStudentId,
            score: newScore,
            feedback: newFeedback
        });

        alert(`Đã lưu điểm ${newScore}đ và lời phê của Thầy Vỹ cho học sinh thành công!`);
        closeInspectModal();
        refreshAllViews();
    });

    // Thầy Vỹ gửi cảnh báo sang học sinh
    document.getElementById("btnSendTeacherAlert").addEventListener("click", () => {
        if (!currentInspectingStudentId) return;
        const student = bus.getStudentById(currentInspectingStudentId);
        const msg = prompt(`Nội dung cảnh báo gửi đến ${student.name}:`, "Thầy Vỹ nhắc nhở: Em hãy tập trung quay lại bài kiểm tra Hóa học ngay!");
        if (msg) {
            bus.send("TEACHER_ALERT", {
                studentId: currentInspectingStudentId,
                message: msg
            });
            alert(`Đã gửi cảnh báo trực tiếp đến màn hình học sinh ${student.name}!`);
        }
    });

    // 6. Voice Alert (Web Speech API)
    function speakText(text) {
        if (!voiceEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "vi-VN";
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
    }

    document.getElementById("btnVoiceToggle").addEventListener("click", () => {
        voiceEnabled = !voiceEnabled;
        const btn = document.getElementById("btnVoiceToggle");
        const icon = document.getElementById("voiceIcon");
        const text = document.getElementById("voiceText");

        if (voiceEnabled) {
            btn.classList.add("active-voice");
            icon.className = "fa-solid fa-volume-high";
            text.textContent = "Giọng đọc: BẬT";
            speakText("Hệ thống giám sát phòng thi Hóa học của Thầy Nguyễn Vỹ đã bật giọng đọc cảnh báo.");
        } else {
            btn.classList.remove("active-voice");
            icon.className = "fa-solid fa-volume-xmark";
            text.textContent = "Giọng đọc: TẮT";
        }
    });

    // 7. Chuyển Tab Navigation
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tabTarget = btn.getAttribute("data-tab");
            currentActiveTab = tabTarget;

            document.querySelectorAll(".tab-content-pane").forEach(pane => {
                pane.style.display = "none";
            });

            const activePane = document.getElementById(tabTarget);
            if (activePane) activePane.style.display = "block";

            if (tabTarget === "tab-live-monitor") {
                renderLiveGrid();
            } else if (tabTarget === "tab-submissions-grading") {
                renderSubmissionsTable(currentFilterTab);
            } else if (tabTarget === "tab-class-manager") {
                renderRosterTable();
            }
        });
    });

    // 8. Filter Chips trong Tab 4 (Ảnh 2)
    document.querySelectorAll(".chip-status").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".chip-status").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            currentFilterTab = chip.getAttribute("data-filter");
            renderSubmissionsTable(currentFilterTab);
        });
    });

    // 9. Tìm kiếm nhanh theo ID hoặc tên
    const searchInput = document.getElementById("inputSearchStudent");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const val = e.target.value;
            if (currentActiveTab === "tab-live-monitor") {
                renderLiveGrid(val);
            } else if (currentActiveTab === "tab-submissions-grading") {
                renderSubmissionsTable(currentFilterTab, val);
            }
        });
    }

    // Soi nhanh ID 4 số trên thanh Header
    document.getElementById("btnQuickInspect").addEventListener("click", () => {
        const id = document.getElementById("quickIdInput").value.trim();
        if (!id) {
            alert("Vui lòng nhập mã ID 4 số của học sinh (Ví dụ: 2101, 2102)!");
            return;
        }
        const student = bus.getStudentById(id);
        if (student) {
            openInspectModal(id);
        } else {
            alert(`Không tìm thấy học sinh có mã ID ${id} trong lớp 12C1!`);
        }
    });

    // 10. Chấm Tự Động (Auto-grade)
    document.getElementById("btnAutoGrade").addEventListener("click", () => {
        const students = getStudents();
        let gradedCount = 0;

        students.forEach(s => {
            if (s.submitted && !s.graded) {
                // Tự động tính điểm
                s.graded = true;
                s.score = s.score || 7.5;
                s.feedback = "Chấm tự động: Hoàn thành tốt các câu trắc nghiệm thí nghiệm este.";
                gradedCount++;
            }
        });

        bus.saveStudents(students);
        alert(`Hệ thống đã tự động chấm điểm cho toàn bộ học sinh đã nộp bài!`);
        refreshAllViews();
    });

    // 11. Mở Lại Bài Nộp
    document.getElementById("btnReopenSubmissions").addEventListener("click", () => {
        if (confirm("Thầy Vỹ có muốn mở lại quyền làm bài cho các học sinh chưa hoàn tất không?")) {
            const students = getStudents();
            students.forEach(s => {
                s.submitted = false;
                s.status = "Đang làm bài...";
            });
            bus.saveStudents(students);
            bus.send("TEACHER_REOPEN", {});
            alert("Đã mở lại bài nộp thành công!");
            refreshAllViews();
        }
    });

    // 12. Xuất File Excel (CSV UTF-8 BOM chuẩn mở bằng MS Excel không lỗi font)
    document.getElementById("btnExportExcel").addEventListener("click", () => {
        const students = getStudents();
        let csvContent = "\uFEFF"; // UTF-8 BOM
        csvContent += "STT,Mã ID,Họ và tên,Lớp,Bài kiểm tra,Thời gian nộp,Dung lượng tiến độ,Trạng thái,Điểm số,Lời phê của Thầy Vỹ,Chỉ số liêm chính,Số lần rời tab\n";

        students.forEach((s, idx) => {
            const row = [
                idx + 1,
                `"${s.id}"`,
                `"${s.name}"`,
                `"${s.class}"`,
                `"${s.assignment}"`,
                `"${s.submitTime}"`,
                `"${s.sizeProgress}"`,
                `"${s.submitted ? 'Đã nộp bài' : 'Chưa nộp'}"`,
                `"${s.score !== null ? s.score : 'Chưa chấm'}"`,
                `"${(s.feedback || '').replace(/"/g, '""')}"`,
                `"${s.integrity}%"`,
                s.leaveCount
            ];
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const currentClass = students.length > 0 ? students[0].class : "12C1";
        a.download = `Bang_Diem_Hoa12_Lop_${currentClass}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // 13. Tải Danh Sách Lớp (Export Student Roster)
    const btnExportStudentRoster = document.getElementById("btnExportStudentRoster");
    if (btnExportStudentRoster) {
        btnExportStudentRoster.addEventListener("click", () => {
            const students = getStudents();
            let csvContent = "\uFEFF"; // UTF-8 BOM
            csvContent += "STT,Mã ID 4 Số,Họ và tên học sinh,Lớp,Trạng thái,Chỉ số liêm chính,Điểm trung bình\n";

            students.forEach((s, idx) => {
                const row = [
                    idx + 1,
                    `"${s.id}"`,
                    `"${s.name}"`,
                    `"${s.class}"`,
                    `"${s.online ? 'Đang hoạt động' : 'Ngoại tuyến'}"`,
                    `"${s.integrity}%"`,
                    `"${s.score !== null ? s.score : ''}"`
                ];
                csvContent += row.join(",") + "\n";
            });

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const currentClass = students.length > 0 ? students[0].class : "12C1";
            a.download = `Danh_Sach_Hoc_Sinh_Lop_${currentClass}_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // 14. Tải File Mẫu Excel để Giáo Viên điền vào
    const btnDownloadTemplate = document.getElementById("btnDownloadTemplate");
    if (btnDownloadTemplate) {
        btnDownloadTemplate.addEventListener("click", () => {
            let csvContent = "\uFEFF"; // UTF-8 BOM
            csvContent += "STT,Mã ID,Họ và tên,Lớp\n";
            csvContent += "1,2101,Nguyễn Văn An,12A1\n";
            csvContent += "2,2102,Trần Thị Bích,12A1\n";
            csvContent += "3,2103,Lê Hoàng Long,12A1\n";

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Mau_Danh_Sach_Hoc_Sinh_Hoa12.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // 15. Quản lý Modal Nhập Danh Sách Học Sinh (Import Modal)
    let parsedImportStudents = [];

    const importModal = document.getElementById("importRosterModal");
    const btnOpenImportModal = document.getElementById("btnOpenImportModal");
    const importModalCloseBtn = document.getElementById("importModalCloseBtn");
    const importModalCancelBtn = document.getElementById("importModalCancelBtn");

    if (btnOpenImportModal) {
        btnOpenImportModal.addEventListener("click", () => {
            parsedImportStudents = [];
            document.getElementById("importPreviewBox").style.display = "none";
            document.getElementById("selectedFileName").textContent = "Chưa chọn file nào";
            document.getElementById("pasteStudentTextarea").value = "";
            importModal.classList.add("active");
        });
    }

    function closeImportModal() {
        if (importModal) importModal.classList.remove("active");
    }

    if (importModalCloseBtn) importModalCloseBtn.addEventListener("click", closeImportModal);
    if (importModalCancelBtn) importModalCancelBtn.addEventListener("click", closeImportModal);

    // Tab chuyển giữa Upload file và Paste text
    const tabChooseFile = document.getElementById("tabChooseFile");
    const tabChoosePaste = document.getElementById("tabChoosePaste");
    const sectionFileUpload = document.getElementById("sectionFileUpload");
    const sectionPasteText = document.getElementById("sectionPasteText");

    if (tabChooseFile && tabChoosePaste) {
        tabChooseFile.addEventListener("click", () => {
            tabChooseFile.style.background = "#e0f2fe";
            tabChooseFile.style.color = "#0284c7";
            tabChooseFile.style.borderColor = "#0284c7";
            tabChoosePaste.style.background = "var(--bg-page)";
            tabChoosePaste.style.color = "var(--text-main)";
            tabChoosePaste.style.borderColor = "var(--border-color)";
            sectionFileUpload.style.display = "block";
            sectionPasteText.style.display = "none";
        });

        tabChoosePaste.addEventListener("click", () => {
            tabChoosePaste.style.background = "#e0f2fe";
            tabChoosePaste.style.color = "#0284c7";
            tabChoosePaste.style.borderColor = "#0284c7";
            tabChooseFile.style.background = "var(--bg-page)";
            tabChooseFile.style.color = "var(--text-main)";
            tabChooseFile.style.borderColor = "var(--border-color)";
            sectionFileUpload.style.display = "none";
            sectionPasteText.style.display = "block";
        });
    }

    // Xử lý đọc File Excel (.xlsx, .xls, .csv)
    const excelFileInput = document.getElementById("excelFileInput");
    if (excelFileInput) {
        excelFileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            document.getElementById("selectedFileName").textContent = `📁 Đang chọn: ${file.name} (${Math.round(file.size / 1024)} KB)`;

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    processImportRows(rows);
                } catch (err) {
                    console.error("Lỗi đọc file Excel:", err);
                    alert("Không thể đọc file Excel này! Vui lòng kiểm tra định dạng .xlsx hoặc .csv.");
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Xử lý dán văn bản (Paste Text)
    const pasteStudentTextarea = document.getElementById("pasteStudentTextarea");
    if (pasteStudentTextarea) {
        pasteStudentTextarea.addEventListener("input", () => {
            const text = pasteStudentTextarea.value.trim();
            if (!text) {
                document.getElementById("importPreviewBox").style.display = "none";
                parsedImportStudents = [];
                return;
            }

            const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
            const className = document.getElementById("importClassName").value.trim() || "12C1";
            let startId = parseInt(document.getElementById("importStartId").value.trim()) || 2101;

            parsedImportStudents = lines.map((line, idx) => {
                // Tách nếu dòng có dạng "1. Nguyễn Văn A" hoặc "2101 \t Nguyễn Văn A"
                let name = line.replace(/^[0-9]+[\.\-\:\t\s]+/, "").trim();
                let id = String(startId + idx);

                // Nếu trong dòng có tab hoặc dấu phẩy phân cách ID và Tên
                if (line.includes("\t") || line.includes(",")) {
                    const parts = line.split(/[\t,]/).map(p => p.trim());
                    if (parts.length >= 2) {
                        if (/^[0-9]{3,6}$/.test(parts[0])) {
                            id = parts[0];
                            name = parts[1];
                        } else {
                            name = parts[0];
                        }
                    }
                }

                return createStudentObject(id, name, className);
            });

            showImportPreview(parsedImportStudents);
        });
    }

    function processImportRows(rows) {
        if (!rows || rows.length === 0) {
            alert("File Excel trống!");
            return;
        }

        // Tìm dòng tiêu đề
        let headerRowIndex = 0;
        let colNameIdx = -1;
        let colIdIdx = -1;
        let colClassIdx = -1;

        for (let r = 0; r < Math.min(10, rows.length); r++) {
            const row = rows[r];
            if (!Array.isArray(row)) continue;
            for (let c = 0; c < row.length; c++) {
                const cell = String(row[c] || "").toLowerCase().trim();
                if (cell.includes("họ và tên") || cell.includes("họ tên") || cell === "tên" || cell === "name") colNameIdx = c;
                if (cell.includes("mã") || cell.includes("id") || cell.includes("sbd") || cell.includes("số báo danh")) colIdIdx = c;
                if (cell.includes("lớp") || cell.includes("class")) colClassIdx = c;
            }
            if (colNameIdx !== -1) {
                headerRowIndex = r;
                break;
            }
        }

        // Nếu không tìm thấy cột có tên rõ ràng, mặc định cột 1 hoặc 2 là Họ Tên
        if (colNameIdx === -1) {
            colNameIdx = rows[0].length > 1 ? 1 : 0;
            headerRowIndex = 0;
        }

        const className = document.getElementById("importClassName").value.trim() || "12C1";
        let startId = parseInt(document.getElementById("importStartId").value.trim()) || 2101;
        parsedImportStudents = [];

        for (let r = headerRowIndex + 1; r < rows.length; r++) {
            const row = rows[r];
            if (!row || !row[colNameIdx]) continue;
            const name = String(row[colNameIdx]).trim();
            if (!name || name === "undefined") continue;

            let id = (colIdIdx !== -1 && row[colIdIdx]) ? String(row[colIdIdx]).trim() : String(startId + parsedImportStudents.length);
            let sClass = (colClassIdx !== -1 && row[colClassIdx]) ? String(row[colClassIdx]).trim() : className;

            parsedImportStudents.push(createStudentObject(id, name, sClass));
        }

        showImportPreview(parsedImportStudents);
    }

    function createStudentObject(id, name, className) {
        return {
            id: String(id),
            name: name,
            class: className,
            online: false,
            assignment: "KT thực hành 12c2",
            warningType: "none",
            warningText: "",
            status: "Chưa tham gia",
            lastActive: "--",
            integrity: 100,
            leaveCount: 0,
            submitted: false,
            submitTime: "--",
            sizeProgress: "0 kt • 0 dòng",
            graded: false,
            score: null,
            feedback: "Chưa nộp bài.",
            liveCode: "",
            answers: {},
            leaveHistory: []
        };
    }

    function showImportPreview(list) {
        const previewBox = document.getElementById("importPreviewBox");
        const countSpan = document.getElementById("previewCount");
        const sampleDiv = document.getElementById("previewSampleList");

        if (!list || list.length === 0) {
            previewBox.style.display = "none";
            return;
        }

        previewBox.style.display = "block";
        countSpan.textContent = list.length;

        const sample = list.slice(0, 5).map(s => `• <strong>${s.id}</strong>: ${s.name} (Lớp: ${s.class})`).join("<br>");
        sampleDiv.innerHTML = sample + (list.length > 5 ? `<br><em>... và ${list.length - 5} học sinh khác.</em>` : "");
    }

    // Xác nhận cập nhật danh sách học sinh vào hệ thống
    const btnConfirmImportRoster = document.getElementById("btnConfirmImportRoster");
    if (btnConfirmImportRoster) {
        btnConfirmImportRoster.addEventListener("click", () => {
            if (!parsedImportStudents || parsedImportStudents.length === 0) {
                alert("Chưa có danh sách học sinh nào được đọc! Vui lòng chọn file Excel hoặc dán danh sách tên học sinh.");
                return;
            }

            const targetClass = parsedImportStudents[0].class || "12C1";

            // Cập nhật danh sách mới
            bus.saveStudents(parsedImportStudents);

            // Cập nhật bộ chọn lớp nếu có
            const selectClassFilter = document.getElementById("selectClassFilter");
            if (selectClassFilter) {
                let hasOption = false;
                for (let i = 0; i < selectClassFilter.options.length; i++) {
                    if (selectClassFilter.options[i].value === targetClass) hasOption = true;
                }
                if (!hasOption) {
                    const opt = document.createElement("option");
                    opt.value = targetClass;
                    opt.textContent = targetClass;
                    selectClassFilter.appendChild(opt);
                }
                selectClassFilter.value = targetClass;
            }

            bus.send("STUDENT_ROSTER_UPDATED", {
                count: parsedImportStudents.length,
                class: targetClass
            });

            closeImportModal();
            refreshAllViews();
            alert(`🎉 Chúc mừng Thầy Vỹ! Đã cập nhật thành công danh sách Lớp ${targetClass} gồm ${parsedImportStudents.length} học sinh vào hệ thống!`);
        });
    }

    // Reset mô phỏng về trạng thái gốc của 2 ảnh
    document.getElementById("btnResetSimulation").addEventListener("click", () => {
        if (confirm("Khôi phục lại dữ liệu mô phỏng gốc (như ảnh môn Tin)?")) {
            localStorage.removeItem("CHEM_STUDENTS");
            localStorage.removeItem("CHEM_TEACHER");
            initChemStorage();
            refreshAllViews();
            alert("Đã khôi phục dữ liệu mô phỏng thành công!");
        }
    });

    // Làm mới dữ liệu
    document.getElementById("btnRefreshData").addEventListener("click", () => {
        refreshAllViews();
    });

    // Chuyển chế độ sáng/tối
    document.getElementById("btnThemeToggle").addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
    });

    function refreshAllViews() {
        updateMetrics();
        if (currentActiveTab === "tab-live-monitor") {
            renderLiveGrid();
        } else if (currentActiveTab === "tab-submissions-grading") {
            renderSubmissionsTable(currentFilterTab);
        } else if (currentActiveTab === "tab-class-manager") {
            renderRosterTable();
        }
        if (currentInspectingStudentId) {
            window.openInspectModal(currentInspectingStudentId);
        }
    }

    // =========================================================================
    // LẮNG NGHE SỰ KIỆN TỪ KÊNH REALTIME CỦA HỌC SINH (REALTIME LISTENER)
    // =========================================================================
    bus.on("STUDENT_LOGIN", (payload) => {
        bus.updateStudent(payload.id, {
            online: true,
            status: "Đang làm bài...",
            lastActive: "Vừa xong"
        });
        refreshAllViews();
        speakText(`Học sinh ${payload.name} vừa đăng nhập vào phòng thi Hóa học.`);
    });

    bus.on("STUDENT_TYPING", (payload) => {
        bus.updateStudent(payload.id, {
            status: "Đang làm bài...",
            lastActive: "Vừa thao tác",
            liveCode: payload.text,
            sizeProgress: payload.progress || `${payload.answeredCount || 1}/6 câu • Đang làm`
        });

        // Nếu thầy đang mở modal của học sinh này thì cập nhật live tức thì
        if (currentInspectingStudentId === String(payload.id)) {
            document.getElementById("modalLiveCodeContent").textContent = payload.text;
            document.getElementById("modalLastKeyTime").textContent = `Cập nhật: vừa gõ`;
        }

        updateMetrics();
        if (currentActiveTab === "tab-live-monitor") renderLiveGrid();
    });

    bus.on("STUDENT_LEAVE_TAB", (payload) => {
        const student = bus.getStudentById(payload.id);
        const leaveCount = (student ? student.leaveCount : 0) + 1;
        const newIntegrity = Math.max(20, 100 - leaveCount * 10);

        const newHistory = student && student.leaveHistory ? [...student.leaveHistory] : [];
        newHistory.unshift({
            time: new Date().toLocaleTimeString("vi-VN"),
            reason: payload.reason || "Rời màn hình / Chuyển tab"
        });

        bus.updateStudent(payload.id, {
            warningType: "leaving_now",
            warningText: `⚠️ ⚠️ ĐANG RỜI TAB (${leaveCount} lần)!`,
            status: "Rời màn hình!",
            leaveCount: leaveCount,
            integrity: newIntegrity,
            leaveHistory: newHistory
        });

        refreshAllViews();
        speakText(`Cảnh báo! Học sinh ${student ? student.name : payload.id} vừa rời khỏi tab bài thi!`);
    });

    bus.on("STUDENT_RETURN_TAB", (payload) => {
        const student = bus.getStudentById(payload.id);
        bus.updateStudent(payload.id, {
            warningType: "left_recent",
            warningText: `⏱️ Vừa Rời màn hình (${student ? student.leaveCount : 1})`,
            status: "Đang làm bài...",
            lastActive: "Vừa quay lại"
        });
        refreshAllViews();
    });

    bus.on("STUDENT_SUBMIT", (payload) => {
        bus.updateStudent(payload.id, {
            submitted: true,
            submitTime: new Date().toLocaleTimeString("vi-VN") + " " + new Date().toLocaleDateString("vi-VN"),
            status: "Đã nộp bài",
            score: payload.score,
            feedback: payload.feedback || "Đã nộp bài đầy đủ.",
            warningType: "none",
            online: false
        });
        refreshAllViews();
        speakText(`Học sinh ${payload.name || payload.id} đã hoàn thành và nộp bài thi Hóa học.`);
    });

    // Khởi tạo ban đầu
    refreshAllViews();
});
