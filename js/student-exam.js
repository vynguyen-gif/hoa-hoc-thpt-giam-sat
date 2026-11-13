/**
 * PHÂN HỆ HỌC SINH (FOCUS MODE & PROCTORING ENGINE)
 * Chế độ làm bài nghiêm ngặt theo chuẩn Công văn 7991
 */

class StudentExamController {
    constructor() {
        this.currentStudent = null;
        this.sessionId = null;
        this.examData = EXAM_QUESTIONS;
        this.metadata = EXAM_METADATA;
        this.answers = {
            part1: {}, // { p1_q1: 'B', ... }
            part2: {}, // { p2_q1: { a: true, b: false, c: true, d: false }, ... }
            part3: {}  // { p3_q1: { text: '...', images: [] }, ... }
        };
        this.warningsCount = 0;
        this.maxWarnings = 3;
        this.isExamStarted = false;
        this.isExamLocked = false;
        this.isSubmitted = false;
        this.timerSeconds = this.metadata.durationMinutes * 60;
        this.timerInterval = null;
        this.currentQuestionIndex = 1; // 1 to 19
        this.keystrokeDebounce = null;

        this.init();
    }

    init() {
        this.bindLoginEvents();
        this.bindProctoringGuards();
        this.bindRealtimeListeners();
        this.checkAutoLoginFromWaitingRoom();
    }

    // Helper chuẩn hóa mã đăng nhập (chấp nhận cả 11A1_01, 11A101, 11a1_01)
    normalizeCode(code) {
        return (code || '').toString().toUpperCase().replace(/[_\-\s]/g, '');
    }

    // Tìm học sinh linh hoạt từ Database Local và Initial List
    findStudent(inputCode) {
        const norm = this.normalizeCode(inputCode);
        if (!norm) return null;

        // 1. Tìm trong supabase_students_db (nơi giáo viên vừa tạo mật khẩu riêng)
        try {
            const localDb = JSON.parse(localStorage.getItem('supabase_students_db') || '[]');
            const found = localDb.find(s => {
                const uNorm = this.normalizeCode(s.username || s.sbd);
                return uNorm === norm;
            });
            if (found) {
                return {
                    sbd: found.username || found.sbd,
                    name: found.ho_ten || found.name,
                    password: (found.password || '').toString().trim(),
                    raw: found
                };
            }
        } catch (e) {
            console.warn(e);
        }

        // 2. Tìm trong INITIAL_STUDENTS_11A1
        if (typeof INITIAL_STUDENTS_11A1 !== 'undefined') {
            const found = INITIAL_STUDENTS_11A1.find(s => {
                const sNorm = this.normalizeCode(s.sbd);
                return sNorm === norm;
            });
            if (found) {
                return {
                    sbd: found.sbd,
                    name: found.name,
                    password: (found.password || '').toString().trim(),
                    raw: found
                };
            }
        }

        return null;
    }

    // Kiểm tra nếu học sinh vào từ phòng chờ phong-cho.html
    checkAutoLoginFromWaitingRoom() {
        const params = new URLSearchParams(window.location.search);
        const userParam = params.get('user');
        const sessionRaw = localStorage.getItem('current_student_session');

        if (sessionRaw && userParam) {
            try {
                const session = JSON.parse(sessionRaw);
                const sbdInput = document.getElementById('student-sbd-input');
                const nameInput = document.getElementById('student-name-input');
                const passInput = document.getElementById('student-pass-input');

                if (sbdInput) sbdInput.value = session.username || userParam;
                if (nameInput) nameInput.value = session.name || '';
                
                // Tự động điền pass nếu có
                const matched = this.findStudent(session.username || userParam);
                if (matched && passInput) {
                    passInput.value = matched.password;
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    // ==========================================
    // 1. URL OBFUSCATION & AUTHENTICATION
    // ==========================================
    bindLoginEvents() {
        const loginForm = document.getElementById('student-login-form');
        const pinInput = document.getElementById('exam-pin-input');
        const sbdInput = document.getElementById('student-sbd-input');
        const passInput = document.getElementById('student-pass-input');
        const nameInput = document.getElementById('student-name-input');
        const loginError = document.getElementById('student-login-error');

        // Tự động nhảy focus mã PIN 6 số
        if (pinInput) {
            pinInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            });
        }

        // Tự động tìm tên học sinh khi gõ SBD hoặc Username
        if (sbdInput) {
            sbdInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                const matched = this.findStudent(val);
                if (matched && nameInput) {
                    nameInput.value = matched.name;
                    if (loginError) loginError.classList.add('hidden');
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const pin = pinInput ? pinInput.value.trim() : '';
                const sbdVal = sbdInput ? sbdInput.value.trim() : '';
                const passwordVal = passInput ? passInput.value.trim() : '';

                if (pin !== this.metadata.pin) {
                    this.showLoginError(`Mã PIN "${pin}" không đúng! Mã PIN đề thi là ${this.metadata.pin}`);
                    return;
                }

                if (!sbdVal) {
                    this.showLoginError("Vui lòng nhập Tên đăng nhập / Số báo danh (SBD)!");
                    return;
                }

                // Tìm học sinh (chấp nhận cả 11A1_01 và 11A101)
                const matchedStudent = this.findStudent(sbdVal);
                if (!matchedStudent) {
                    this.showLoginError(`Tài khoản "${sbdVal}" không tồn tại trong danh sách lớp 11A1! Vui lòng kiểm tra lại Username (VD: 11A1_01).`);
                    return;
                }

                // Kiểm tra Mật khẩu riêng
                if (matchedStudent.password && passwordVal !== matchedStudent.password) {
                    this.showLoginError(`Mật khẩu không chính xác cho thí sinh ${matchedStudent.name} (${sbdVal})! Vui lòng nhập đúng mật khẩu riêng được cấp.`);
                    return;
                }

                const finalSbd = matchedStudent.sbd;
                const finalName = matchedStudent.name;
                this.startSession(finalSbd, finalName, pin);
            });
        }
    }

    showLoginError(msg) {
        const el = document.getElementById('student-login-error');
        if (el) {
            el.innerHTML = `<strong>Lỗi:</strong> ${msg}`;
            el.classList.remove('hidden');
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert(msg);
        }
    }

    startSession(sbd, name, pin) {
        this.sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        this.currentStudent = { sbd, name, pin, sessionId: this.sessionId };

        // Lưu session vào localStorage
        localStorage.setItem('chem_current_session', JSON.stringify(this.currentStudent));

        // Phục hồi bài làm cũ nếu có trong LocalStorage (Auto-save recover)
        const savedProgress = localStorage.getItem(`chem_progress_${sbd}`);
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress);
                this.answers = parsed.answers || this.answers;
                this.warningsCount = parsed.warningsCount || 0;
                if (parsed.timerSeconds && parsed.timerSeconds > 0) {
                    this.timerSeconds = parsed.timerSeconds;
                }
            } catch (err) {
                console.error("Lỗi parse bài làm cũ:", err);
            }
        }

        // Bắn tín hiệu Login tới hệ thống giám sát (Single Active Session & Live Monitor)
        window.proctoringService.publish('STUDENT_LOGIN', {
            sbd,
            name,
            sessionId: this.sessionId,
            time: new Date().toLocaleTimeString()
        });

        // Ẩn màn hình đăng nhập, hiện modal Toàn màn hình
        document.getElementById('student-login-view')?.classList.add('hidden');
        this.showFullscreenPrompt();
    }

    // ==========================================
    // 2. PROCTORING & ANTI-CHEAT LOGIC
    // ==========================================
    bindProctoringGuards() {
        // A. Chặn chuột phải (Context Menu)
        document.addEventListener('contextmenu', (e) => {
            if (this.isExamStarted && !this.isSubmitted) {
                e.preventDefault();
                this.showToastWarning("Thao tác chuột phải đã bị vô hiệu hóa trong phòng thi!");
                return false;
            }
        });

        // B. Chặn các phím tắt copy, paste, inspect, print
        document.addEventListener('keydown', (e) => {
            if (!this.isExamStarted || this.isSubmitted) return;

            const isCtrlOrMeta = e.ctrlKey || e.metaKey;
            const blockedKeys = ['c', 'v', 'u', 's', 'p', 'a'];

            if (isCtrlOrMeta && blockedKeys.includes(e.key.toLowerCase())) {
                e.preventDefault();
                this.showToastWarning(`Phím tắt [Ctrl+${e.key.toUpperCase()}] bị cấm trong phòng thi!`);
                return false;
            }

            // Chặn F12 và Ctrl+Shift+I/J/C
            if (e.key === 'F12' || (isCtrlOrMeta && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
                e.preventDefault();
                this.recordViolation("Cố gắng mở công cụ phát triển (DevTools)");
                return false;
            }
        });

        // C. Giám sát Fullscreen change
        document.addEventListener('fullscreenchange', () => {
            if (this.isExamStarted && !this.isSubmitted) {
                if (!document.fullscreenElement) {
                    this.recordViolation("Thoát chế độ Toàn màn hình (Fullscreen)");
                }
            }
        });

        // D. Giám sát Page Visibility API (Chuyển tab) & Window Blur
        document.addEventListener('visibilitychange', () => {
            if (this.isExamStarted && !this.isSubmitted) {
                if (document.visibilityState === 'hidden') {
                    this.recordViolation("Rời khỏi bài thi / Chuyển sang tab khác");
                }
            }
        });

        window.addEventListener('blur', () => {
            if (this.isExamStarted && !this.isSubmitted && document.fullscreenElement) {
                this.recordViolation("Chuyển tiêu điểm ra ngoài màn hình làm bài");
            }
        });
    }

    bindRealtimeListeners() {
        // Lắng nghe cơ chế Single Active Session
        window.proctoringService.subscribe('STUDENT_LOGIN', (data) => {
            if (this.currentStudent && data.sbd === this.currentStudent.sbd && data.sessionId !== this.currentStudent.sessionId) {
                this.handleMultipleLoginsDetected();
            }
        });

        // Lắng nghe lệnh từ Giáo viên (Unlock, Force Submit)
        window.proctoringService.subscribe('TEACHER_ACTION', (data) => {
            if (this.currentStudent && (data.targetSbd === this.currentStudent.sbd || data.targetSbd === 'ALL')) {
                if (data.action === 'UNLOCK') {
                    this.unlockExamByTeacher();
                } else if (data.action === 'FORCE_SUBMIT') {
                    this.submitExam(true);
                }
            }
        });
    }

    showFullscreenPrompt() {
        const modal = document.getElementById('fullscreen-prompt-modal');
        if (modal) {
            modal.classList.remove('hidden');
            const studentBadge = document.getElementById('fs-student-badge');
            if (studentBadge && this.currentStudent) {
                studentBadge.textContent = `${this.currentStudent.name} (${this.currentStudent.sbd})`;
            }

            const enterBtn = document.getElementById('btn-enter-fullscreen-exam');
            enterBtn.onclick = () => {
                this.enterFullscreenAndStart();
            };
        }
    }

    async enterFullscreenAndStart() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.warn("Fullscreen API fallback:", err);
        }

        const modal = document.getElementById('fullscreen-prompt-modal');
        if (modal) modal.classList.add('hidden');

        document.getElementById('student-focus-mode-view')?.classList.remove('hidden');
        this.isExamStarted = true;

        const examContainer = document.getElementById('student-focus-mode-view');
        if (examContainer && this.currentStudent) {
            examContainer.setAttribute('data-watermark', `${this.currentStudent.sbd} - ${this.currentStudent.name}`);
        }

        this.renderExamInterface();
        this.startTimer();
        this.broadcastProgress('active');
    }

    recordViolation(reason) {
        if (this.isExamLocked || this.isSubmitted) return;

        this.warningsCount++;
        this.saveToLocalStorage();

        window.proctoringService.publish('STUDENT_BLUR', {
            sbd: this.currentStudent.sbd,
            name: this.currentStudent.name,
            warnings: this.warningsCount,
            reason: reason,
            time: new Date().toLocaleTimeString()
        });

        if (this.warningsCount >= this.maxWarnings) {
            this.lockExamDueToViolations();
        } else {
            this.showViolationModal(reason);
        }
    }

    showViolationModal(reason) {
        const modal = document.getElementById('violation-warning-modal');
        const reasonText = document.getElementById('violation-reason-text');
        const countText = document.getElementById('violation-count-text');
        const resumeBtn = document.getElementById('btn-resume-exam');

        if (modal) {
            reasonText.textContent = reason;
            countText.textContent = `${this.warningsCount}/${this.maxWarnings}`;
            modal.classList.remove('hidden');

            resumeBtn.onclick = async () => {
                try {
                    if (!document.fullscreenElement) {
                        await document.documentElement.requestFullscreen();
                    }
                } catch (e) {}
                modal.classList.add('hidden');
                this.broadcastProgress('active');
            };
        }
    }

    lockExamDueToViolations() {
        this.isExamLocked = true;
        clearInterval(this.timerInterval);

        document.getElementById('violation-warning-modal')?.classList.add('hidden');
        document.getElementById('exam-locked-screen')?.classList.remove('hidden');

        window.proctoringService.publish('STUDENT_LOCK', {
            sbd: this.currentStudent.sbd,
            name: this.currentStudent.name,
            time: new Date().toLocaleTimeString()
        });
    }

    unlockExamByTeacher() {
        this.isExamLocked = false;
        this.warningsCount = 0;
        this.saveToLocalStorage();

        document.getElementById('exam-locked-screen')?.classList.add('hidden');
        this.showToastSuccess("Giáo viên đã mở khóa bài thi cho bạn. Vui lòng nghiêm túc làm bài!");
        this.startTimer();
        this.broadcastProgress('active');
    }

    handleMultipleLoginsDetected() {
        this.isExamLocked = true;
        clearInterval(this.timerInterval);

        alert("CẢNH BÁO: Tài khoản của bạn vừa đăng nhập ở một trình duyệt hoặc thiết bị khác!\nPhiên làm việc này bị hủy để bảo mật kỳ thi.");
        window.location.reload();
    }

    // ==========================================
    // 3. UI RENDERING & QUESTION NAVIGATION
    // ==========================================
    renderExamInterface() {
        const sbdEl = document.getElementById('header-student-sbd');
        const nameEl = document.getElementById('header-student-name');
        if (sbdEl) sbdEl.textContent = this.currentStudent.sbd;
        if (nameEl) nameEl.textContent = this.currentStudent.name;

        this.renderQuestionGrid();
        this.renderQuestionsContent();
        this.bindActionButtons();
    }

    renderQuestionGrid() {
        const gridContainer = document.getElementById('question-grid-container');
        if (!gridContainer) return;

        let html = `
            <div class="mb-3">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Phần I: Trắc nghiệm 4 chọn</span>
                    <span class="text-slate-400 font-mono">12 câu</span>
                </div>
                <div class="grid grid-cols-6 gap-1.5">
        `;

        for (let i = 1; i <= 12; i++) {
            const isAnswered = this.answers.part1[`p1_q${i}`] !== undefined;
            const statusClass = isAnswered ? 'bg-emerald-500 text-white font-semibold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700';
            html += `
                <button type="button" data-qindex="${i}" onclick="window.studentExam.jumpToQuestion(${i})" 
                    class="q-grid-btn h-8 rounded text-xs transition flex items-center justify-center ${statusClass} border border-slate-200" id="grid-btn-${i}">
                    ${i}
                </button>
            `;
        }

        html += `
                </div>
            </div>

            <div class="mb-3 pt-2 border-t border-slate-100">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Phần II: Đúng / Sai</span>
                    <span class="text-slate-400 font-mono">4 câu</span>
                </div>
                <div class="grid grid-cols-4 gap-1.5">
        `;

        for (let i = 13; i <= 16; i++) {
            const qKey = `p2_q${i - 12}`;
            const answeredItems = this.answers.part2[qKey] ? Object.keys(this.answers.part2[qKey]).length : 0;
            const statusClass = answeredItems === 4 ? 'bg-emerald-500 text-white font-semibold' : (answeredItems > 0 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700');
            html += `
                <button type="button" data-qindex="${i}" onclick="window.studentExam.jumpToQuestion(${i})" 
                    class="q-grid-btn h-8 rounded text-xs transition flex items-center justify-center ${statusClass} border border-slate-200" id="grid-btn-${i}">
                    ${i}
                </button>
            `;
        }

        html += `
                </div>
            </div>

            <div class="pt-2 border-t border-slate-100">
                <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Phần III: Tự luận</span>
                    <span class="text-slate-400 font-mono">3 câu</span>
                </div>
                <div class="grid grid-cols-3 gap-1.5">
        `;

        for (let i = 17; i <= 19; i++) {
            const qKey = `p3_q${i - 16}`;
            const essayData = this.answers.part3[qKey];
            const isAnswered = essayData && (essayData.text?.trim()?.length > 10 || essayData.images?.length > 0);
            const statusClass = isAnswered ? 'bg-emerald-500 text-white font-semibold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700';
            html += `
                <button type="button" data-qindex="${i}" onclick="window.studentExam.jumpToQuestion(${i})" 
                    class="q-grid-btn h-8 rounded text-xs transition flex items-center justify-center ${statusClass} border border-slate-200" id="grid-btn-${i}">
                    ${i}
                </button>
            `;
        }

        html += `
                </div>
            </div>
        `;

        gridContainer.innerHTML = html;
        this.highlightActiveGridButton();
    }

    renderQuestionsContent() {
        const contentContainer = document.getElementById('exam-questions-scroll-area');
        if (!contentContainer) return;

        let html = '';

        // --- PHẦN I ---
        html += `
            <div class="mb-8">
                <div class="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-6">
                    <h3 class="font-bold text-blue-900 text-base">PHẦN I: CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (3.0 điểm)</h3>
                    <p class="text-xs text-blue-700 mt-1">Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi chỉ chọn một phương án chính xác nhất.</p>
                </div>
        `;

        this.examData.part1.forEach((q) => {
            const selectedOpt = this.answers.part1[q.id];
            html += `
                <div class="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm scroll-mt-20 unselectable" id="q-card-${q.index}">
                    <div class="flex items-start justify-between gap-4 mb-3">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                            Câu ${q.index}
                        </span>
                        <span class="text-xs text-slate-400 font-mono">0.25 điểm</span>
                    </div>
                    <div class="text-slate-800 font-medium leading-relaxed mb-4 text-sm md:text-base">
                        ${q.text}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            `;

            q.options.forEach((opt) => {
                const isChecked = selectedOpt === opt.id;
                html += `
                    <label class="chem-choice-label flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${isChecked ? 'selected border-blue-500 bg-blue-50' : 'border-slate-200'}">
                        <input type="radio" name="part1_${q.id}" value="${opt.id}" ${isChecked ? 'checked' : ''}
                            onchange="window.studentExam.selectPart1Choice('${q.id}', '${opt.id}', ${q.index})"
                            class="w-4 h-4 text-blue-600 focus:ring-blue-500">
                        <span class="font-bold text-xs ${isChecked ? 'text-blue-700' : 'text-slate-500'}">${opt.id}.</span>
                        <span class="text-sm text-slate-700">${opt.text}</span>
                    </label>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        // --- PHẦN II ---
        html += `
            <div class="mb-8">
                <div class="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg mb-6">
                    <h3 class="font-bold text-amber-900 text-base">PHẦN II: CÂU TRẮC NGHIỆM ĐÚNG / SAI (4.0 điểm)</h3>
                    <p class="text-xs text-amber-700 mt-1">Thí sinh trả lời từ câu 1 đến câu 4 (ứng với thứ tự 13 đến 16). Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.</p>
                </div>
        `;

        this.examData.part2.forEach((q) => {
            const studentChoices = this.answers.part2[q.id] || {};
            html += `
                <div class="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm scroll-mt-20 unselectable" id="q-card-${q.index}">
                    <div class="flex items-start justify-between gap-4 mb-3">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                            ${q.label} (Câu ${q.index})
                        </span>
                        <span class="text-xs text-slate-400 font-mono">1.0 điểm</span>
                    </div>
                    <div class="text-slate-800 font-medium leading-relaxed mb-4 text-sm md:text-base">
                        ${q.scenario}
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr class="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                    <th class="py-2.5 px-3">Lệnh hỏi</th>
                                    <th class="py-2.5 px-3 w-24 text-center">Đúng</th>
                                    <th class="py-2.5 px-3 w-24 text-center">Sai</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
            `;

            q.items.forEach((item) => {
                const isTrue = studentChoices[item.id] === true;
                const isFalse = studentChoices[item.id] === false;

                html += `
                    <tr class="hover:bg-slate-50/50">
                        <td class="py-3 px-3 text-slate-700">
                            <span class="font-bold text-slate-900 mr-1.5">${item.id})</span>
                            ${item.text}
                        </td>
                        <td class="py-3 px-3 text-center">
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="radio" name="${q.id}_item_${item.id}" value="true" ${isTrue ? 'checked' : ''}
                                    onchange="window.studentExam.selectPart2Item('${q.id}', '${item.id}', true, ${q.index})"
                                    class="w-4 h-4 text-emerald-600 focus:ring-emerald-500">
                            </label>
                        </td>
                        <td class="py-3 px-3 text-center">
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="radio" name="${q.id}_item_${item.id}" value="false" ${isFalse ? 'checked' : ''}
                                    onchange="window.studentExam.selectPart2Item('${q.id}', '${item.id}', false, ${q.index})"
                                    class="w-4 h-4 text-rose-600 focus:ring-rose-500">
                            </label>
                        </td>
                    </tr>
                `;
            });

            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        // --- PHẦN III ---
        html += `
            <div class="mb-8">
                <div class="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg mb-6">
                    <h3 class="font-bold text-indigo-900 text-base">PHẦN III: CÂU HỎI TỰ LUẬN & TRẢ LỜI NGẮN (3.0 điểm)</h3>
                    <p class="text-xs text-indigo-700 mt-1">Gồm 3 câu hỏi (thứ tự 17 đến 19). Thí sinh có thể gõ văn bản/công thức trực tiếp hoặc đính kèm ảnh chụp bài làm tay.</p>
                </div>
        `;

        this.examData.part3.forEach((q) => {
            const essayData = this.answers.part3[q.id] || { text: '', images: [] };
            html += `
                <div class="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm scroll-mt-20" id="q-card-${q.index}">
                    <div class="flex items-start justify-between gap-4 mb-3">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                            ${q.label} (Câu ${q.index})
                        </span>
                        <span class="text-xs text-slate-400 font-mono">1.0 điểm</span>
                    </div>
                    <h4 class="font-semibold text-slate-800 mb-2">${q.title}</h4>
                    <div class="text-slate-700 font-normal leading-relaxed mb-4 text-sm unselectable">
                        ${q.text}
                    </div>

                    <!-- Area gõ tự luận -->
                    <div class="mb-3">
                        <label class="block text-xs font-medium text-slate-600 mb-1">
                            Lời giải / Lập luận của thí sinh:
                        </label>
                        <textarea id="essay_text_${q.id}" rows="5"
                            placeholder="Gõ các bước giải, công thức hóa học, phương trình phản ứng tại đây..."
                            oninput="window.studentExam.handleEssayKeystroke('${q.id}', this.value, ${q.index})"
                            class="w-full text-sm font-sans rounded-lg border-slate-300 border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-3 text-slate-800 leading-relaxed">${essayData.text || ''}</textarea>
                    </div>

                    <!-- Upload ảnh bài làm -->
                    <div class="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100">
                        <div class="flex items-center gap-2">
                            <label for="essay_upload_${q.id}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition">
                                <i data-lucide="camera" class="w-4 h-4 text-slate-500"></i>
                                <span>Chụp / Tải ảnh bài làm</span>
                            </label>
                            <input type="file" id="essay_upload_${q.id}" accept="image/*" class="hidden"
                                onchange="window.studentExam.handleImageUpload('${q.id}', this, ${q.index})">
                            <span class="text-xs text-slate-400">(Hỗ trợ JPG, PNG chụp từ giấy thi)</span>
                        </div>
                        <div id="essay_img_preview_${q.id}" class="flex items-center gap-2">
                            ${(essayData.images || []).map((img, idx) => `
                                <div class="relative group w-12 h-12 rounded border border-slate-300 overflow-hidden">
                                    <img src="${img}" class="w-full h-full object-cover">
                                    <button type="button" onclick="window.studentExam.removeEssayImage('${q.id}', ${idx}, ${q.index})"
                                        class="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs">
                                        ✕
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        contentContainer.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    }

    bindActionButtons() {
        const submitBtn = document.getElementById('btn-submit-exam');
        if (submitBtn) {
            submitBtn.onclick = () => this.showSubmitConfirmationModal();
        }
    }

    // ==========================================
    // 4. STUDENT ANSWER HANDLERS & AUTO-SAVE
    // ==========================================
    selectPart1Choice(qId, optionId, index) {
        this.answers.part1[qId] = optionId;
        this.saveToLocalStorage();
        this.renderQuestionGrid();
        this.broadcastProgress('active');
    }

    selectPart2Item(qId, itemId, boolVal, index) {
        if (!this.answers.part2[qId]) {
            this.answers.part2[qId] = {};
        }
        this.answers.part2[qId][itemId] = boolVal;
        this.saveToLocalStorage();
        this.renderQuestionGrid();
        this.broadcastProgress('active');
    }

    handleEssayKeystroke(qId, val, index) {
        if (!this.answers.part3[qId]) {
            this.answers.part3[qId] = { text: '', images: [] };
        }
        this.answers.part3[qId].text = val;
        this.saveToLocalStorage();
        this.renderQuestionGrid();

        clearTimeout(this.keystrokeDebounce);
        this.keystrokeDebounce = setTimeout(() => {
            window.proctoringService.publish('STUDENT_ESSAY_KEYSTROKE', {
                sbd: this.currentStudent.sbd,
                name: this.currentStudent.name,
                questionId: qId,
                snippet: val.slice(-120),
                fullText: val,
                time: new Date().toLocaleTimeString()
            });
            this.broadcastProgress('active');
        }, 350);
    }

    handleImageUpload(qId, inputEl, index) {
        const file = inputEl.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            if (!this.answers.part3[qId]) {
                this.answers.part3[qId] = { text: '', images: [] };
            }
            if (!this.answers.part3[qId].images) {
                this.answers.part3[qId].images = [];
            }
            this.answers.part3[qId].images.push(dataUrl);

            this.saveToLocalStorage();
            this.renderQuestionsContent();
            this.renderQuestionGrid();
            this.broadcastProgress('active');
            this.showToastSuccess("Đã đính kèm ảnh bài làm thành công!");
        };
        reader.readAsDataURL(file);
    }

    removeEssayImage(qId, imgIndex, qIndex) {
        if (this.answers.part3[qId] && this.answers.part3[qId].images) {
            this.answers.part3[qId].images.splice(imgIndex, 1);
            this.saveToLocalStorage();
            this.renderQuestionsContent();
            this.renderQuestionGrid();
        }
    }

    saveToLocalStorage() {
        if (!this.currentStudent) return;
        const payload = {
            sbd: this.currentStudent.sbd,
            answers: this.answers,
            warningsCount: this.warningsCount,
            timerSeconds: this.timerSeconds,
            lastSavedAt: new Date().toISOString()
        };
        localStorage.setItem(`chem_progress_${this.currentStudent.sbd}`, JSON.stringify(payload));
    }

    calculateProgress() {
        let totalItems = 12 + (4 * 4) + 3;
        let completed = 0;

        completed += Object.keys(this.answers.part1).length;
        Object.values(this.answers.part2).forEach(obj => {
            completed += Object.keys(obj).length;
        });
        Object.values(this.answers.part3).forEach(obj => {
            if (obj && (obj.text?.trim()?.length > 5 || obj.images?.length > 0)) {
                completed += 1;
            }
        });

        return Math.min(100, Math.round((completed / totalItems) * 100));
    }

    broadcastProgress(status = 'active') {
        if (!this.currentStudent) return;
        const progress = this.calculateProgress();

        window.proctoringService.publish('STUDENT_HEARTBEAT', {
            sbd: this.currentStudent.sbd,
            name: this.currentStudent.name,
            status: this.isExamLocked ? 'locked' : status,
            progress: progress,
            warnings: this.warningsCount,
            currentQuestion: this.currentQuestionIndex,
            lastSeen: new Date().toLocaleTimeString()
        });
    }

    // ==========================================
    // 5. TIMER & QUESTION JUMPING
    // ==========================================
    startTimer() {
        clearInterval(this.timerInterval);
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            if (this.timerSeconds > 0) {
                this.timerSeconds--;
                this.updateTimerDisplay();

                if (this.timerSeconds % 15 === 0) {
                    this.saveToLocalStorage();
                    this.broadcastProgress('active');
                }
            } else {
                clearInterval(this.timerInterval);
                this.submitExam(true);
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerEl = document.getElementById('exam-sticky-timer');
        if (!timerEl) return;

        const minutes = Math.floor(this.timerSeconds / 60);
        const seconds = this.timerSeconds % 60;
        const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        timerEl.textContent = formatted;

        const container = document.getElementById('timer-badge-container');
        if (container) {
            if (this.timerSeconds <= 300) {
                container.classList.remove('bg-slate-900', 'text-white');
                container.classList.add('bg-rose-600', 'text-white', 'pulse-danger');
            } else {
                container.classList.add('bg-slate-900', 'text-white');
                container.classList.remove('bg-rose-600', 'pulse-danger');
            }
        }
    }

    jumpToQuestion(index) {
        this.currentQuestionIndex = index;
        const targetEl = document.getElementById(`q-card-${index}`);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        this.highlightActiveGridButton();
    }

    highlightActiveGridButton() {
        document.querySelectorAll('.q-grid-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-600', 'ring-offset-1');
        });
        const currentBtn = document.getElementById(`grid-btn-${this.currentQuestionIndex}`);
        if (currentBtn) {
            currentBtn.classList.add('ring-2', 'ring-blue-600', 'ring-offset-1');
        }
    }

    // ==========================================
    // 6. SUBMISSION & COMPLETION
    // ==========================================
    showSubmitConfirmationModal() {
        const modal = document.getElementById('submit-confirm-modal');
        const summaryText = document.getElementById('submit-summary-text');

        if (modal) {
            const progress = this.calculateProgress();
            summaryText.innerHTML = `
                Tiến độ làm bài hiện tại: <strong>${progress}%</strong>.<br/>
                Bạn có chắc chắn muốn nộp bài thi môn Hóa học ngay bây giờ? 
                Sau khi nộp, bạn sẽ không thể chỉnh sửa đáp án nữa.
            `;
            modal.classList.remove('hidden');

            document.getElementById('btn-cancel-submit').onclick = () => {
                modal.classList.add('hidden');
            };

            document.getElementById('btn-confirm-submit').onclick = () => {
                modal.classList.add('hidden');
                this.submitExam(false);
            };
        }
    }

    submitExam(isAuto = false) {
        this.isSubmitted = true;
        clearInterval(this.timerInterval);

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        window.proctoringService.publish('STUDENT_SUBMIT', {
            sbd: this.currentStudent.sbd,
            name: this.currentStudent.name,
            answers: this.answers,
            progress: this.calculateProgress(),
            isAutoSubmit: isAuto,
            submittedAt: new Date().toLocaleTimeString()
        });

        document.getElementById('student-focus-mode-view')?.classList.add('hidden');
        const completeView = document.getElementById('student-complete-view');
        if (completeView) {
            completeView.classList.remove('hidden');
            document.getElementById('complete-student-name').textContent = this.currentStudent.name;
            document.getElementById('complete-student-sbd').textContent = this.currentStudent.sbd;
            document.getElementById('complete-submit-time').textContent = new Date().toLocaleString();
        }
    }

    showToastWarning(msg) {
        const toast = document.getElementById('exam-toast-notification');
        if (toast) {
            toast.textContent = msg;
            toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg text-sm bg-rose-600 text-white shadow-lg z-50 transition opacity-100';
            setTimeout(() => {
                toast.className = 'hidden';
            }, 3000);
        }
    }

    showToastSuccess(msg) {
        const toast = document.getElementById('exam-toast-notification');
        if (toast) {
            toast.textContent = msg;
            toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg text-sm bg-emerald-600 text-white shadow-lg z-50 transition opacity-100';
            setTimeout(() => {
                toast.className = 'hidden';
            }, 3000);
        }
    }
}

// Khởi tạo controller
window.studentExam = new StudentExamController();
