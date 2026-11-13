/**
 * PHÂN HỆ GIÁO VIÊN (MINIMALIST DASHBOARD & LIVE MONITOR)
 * Giám sát phòng thi thời gian thực & Quản lý danh sách học sinh với SheetJS
 */

class TeacherDashboardController {
    constructor() {
        this.students = [];
        this.selectedStudent = null;
        this.activeTab = 'live-monitor'; // 'live-monitor' | 'class-manager' | 'exam-bank'
        this.filterStatus = 'all';
        this.searchQuery = '';
        this.proctorLogs = [];

        this.init();
    }

    init() {
        this.loadInitialClassData();
        this.bindNavigation();
        this.bindRealtimeTelemetry();
        this.bindSheetJSExcelDropzone();
        this.renderLiveMonitorGrid();
        this.updateStatsCounters();
    }

    loadInitialClassData() {
        // Khởi tạo danh sách 47 học sinh lớp 10A3
        const saved = localStorage.getItem('chem_teacher_students_10a3');
        if (saved) {
            try {
                this.students = JSON.parse(saved);
            } catch (e) {
                this.students = generateFullClass10A3();
            }
        } else {
            this.students = generateFullClass10A3();
            this.saveStudentsToStorage();
        }
    }

    saveStudentsToStorage() {
        localStorage.setItem('chem_teacher_students_10a3', JSON.stringify(this.students));
    }

    // ==========================================
    // 1. SIDEBAR NAVIGATION
    // ==========================================
    bindNavigation() {
        const navBtns = document.querySelectorAll('.teacher-nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.dataset.view;
                this.switchTab(targetView);
            });
        });

        // Search & Filter trong Live Monitor
        const searchInput = document.getElementById('monitor-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderLiveMonitorGrid();
            });
        }

        const filterSelect = document.getElementById('monitor-status-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterStatus = e.target.value;
                this.renderLiveMonitorGrid();
            });
        }
    }

    switchTab(tabId) {
        this.activeTab = tabId;

        // Cập nhật style nút active
        document.querySelectorAll('.teacher-nav-btn').forEach(btn => {
            if (btn.dataset.view === tabId) {
                btn.classList.add('bg-slate-900', 'text-white', 'font-semibold');
                btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
            } else {
                btn.classList.remove('bg-slate-900', 'text-white', 'font-semibold');
                btn.classList.add('text-slate-600', 'hover:bg-slate-100');
            }
        });

        // Ẩn hiện các view panel
        document.querySelectorAll('.teacher-tab-panel').forEach(panel => {
            panel.classList.add('hidden');
        });

        const activePanel = document.getElementById(`panel-${tabId}`);
        if (activePanel) {
            activePanel.classList.remove('hidden');
        }

        if (tabId === 'live-monitor') {
            this.renderLiveMonitorGrid();
        } else if (tabId === 'class-manager') {
            this.renderClassTable();
        }
    }

    // ==========================================
    // 2. REALTIME TELEMETRY LISTENER
    // ==========================================
    bindRealtimeTelemetry() {
        // Thí sinh Login
        window.proctoringService.subscribe('STUDENT_LOGIN', (data) => {
            this.handleStudentEvent(data.sbd, { status: 'active' }, `Thí sinh ${data.name} (${data.sbd}) vừa đăng nhập phòng thi.`);
        });

        // Heartbeat & Tiến độ
        window.proctoringService.subscribe('STUDENT_HEARTBEAT', (data) => {
            this.handleStudentEvent(data.sbd, {
                status: data.status,
                progress: data.progress,
                warnings: data.warnings,
                currentQuestion: data.currentQuestion,
                lastSeen: data.lastSeen
            });
        });

        // Chuyển tab / Vi phạm (Blur)
        window.proctoringService.subscribe('STUDENT_BLUR', (data) => {
            this.handleStudentEvent(data.sbd, {
                status: data.warnings >= 3 ? 'locked' : 'blur',
                warnings: data.warnings
            }, `CẢNH BÁO [${data.sbd} - ${data.name}]: ${data.reason} (Lần ${data.warnings}/3)`);
        });

        // Khóa bài (Locked)
        window.proctoringService.subscribe('STUDENT_LOCK', (data) => {
            this.handleStudentEvent(data.sbd, {
                status: 'locked',
                warnings: 3
            }, `KHÓA BÀI THI: Thí sinh ${data.name} (${data.sbd}) đã vi phạm 3 lần!`);
        });

        // Live Keystroke Tự luận (Google Docs style)
        window.proctoringService.subscribe('STUDENT_ESSAY_KEYSTROKE', (data) => {
            this.handleStudentEvent(data.sbd, {
                lastEssaySnippet: data.snippet,
                fullEssayText: data.fullText,
                lastKeystrokeTime: data.time
            });

            // Nếu đang mở drawer của học sinh này thì cập nhật live text
            if (this.selectedStudent && this.selectedStudent.sbd === data.sbd) {
                const liveBox = document.getElementById('drawer-live-essay-content');
                if (liveBox) {
                    liveBox.textContent = data.fullText || data.snippet;
                }
            }
        });

        // Thí sinh nộp bài
        window.proctoringService.subscribe('STUDENT_SUBMIT', (data) => {
            this.handleStudentEvent(data.sbd, {
                status: 'submitted',
                progress: 100,
                submittedAnswers: data.answers
            }, `Thí sinh ${data.name} (${data.sbd}) đã nộp bài thi thành công.`);
        });
    }

    handleStudentEvent(sbd, patch, logMessage = null) {
        let student = this.students.find(s => s.sbd === sbd);
        if (!student) {
            // Tự động thêm vào danh sách nếu thí sinh chưa có sẵn
            student = {
                sbd,
                name: patch.name || `Thí sinh ${sbd}`,
                status: 'active',
                warnings: 0,
                progress: 0,
                pin: '889966',
                avatar: sbd.slice(0, 2)
            };
            this.students.push(student);
        }

        Object.assign(student, patch);
        this.saveStudentsToStorage();
        this.updateStatsCounters();

        if (logMessage) {
            this.addProctorLog(logMessage);
        }

        // Re-render card
        if (this.activeTab === 'live-monitor') {
            this.renderSingleCard(student);
        }
    }

    addProctorLog(msg) {
        const time = new Date().toLocaleTimeString();
        this.proctorLogs.unshift({ time, msg });
        if (this.proctorLogs.length > 50) this.proctorLogs.pop();

        const logContainer = document.getElementById('live-proctor-feed');
        if (logContainer) {
            const isDanger = msg.includes('CẢNH BÁO') || msg.includes('KHÓA BÀI');
            const item = document.createElement('div');
            item.className = `p-2 rounded text-xs border ${isDanger ? 'bg-rose-50 border-rose-200 text-rose-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-700'} mb-1.5`;
            item.innerHTML = `<span class="font-mono text-slate-400 mr-1.5">[${time}]</span> ${msg}`;
            logContainer.prepend(item);
        }
    }

    // ==========================================
    // 3. LIVE MONITOR GRID VIEW
    // ==========================================
    renderLiveMonitorGrid() {
        const grid = document.getElementById('live-monitor-grid');
        if (!grid) return;

        let filtered = this.students;

        // Lọc theo search
        if (this.searchQuery) {
            filtered = filtered.filter(s => 
                s.sbd.toLowerCase().includes(this.searchQuery) || 
                s.name.toLowerCase().includes(this.searchQuery)
            );
        }

        // Lọc theo status
        if (this.filterStatus !== 'all') {
            filtered = filtered.filter(s => s.status === this.filterStatus);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center text-slate-400">
                    <i data-lucide="user-x" class="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2"></i>
                    <p class="text-sm">Không tìm thấy thí sinh phù hợp với bộ lọc</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        grid.innerHTML = filtered.map(student => this.buildCardHtml(student)).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    renderSingleCard(student) {
        const existingCard = document.getElementById(`monitor-card-${student.sbd}`);
        if (existingCard) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.buildCardHtml(student);
            existingCard.replaceWith(tempDiv.firstElementChild);
            if (window.lucide) window.lucide.createIcons();
        } else {
            this.renderLiveMonitorGrid();
        }
    }

    buildCardHtml(student) {
        // Cấu hình style và badge theo trạng thái
        let statusBadge = '';
        let borderClass = 'border-slate-200 hover:border-slate-300';
        let cardBg = 'bg-white';

        switch (student.status) {
            case 'active':
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-active"></span>
                        Đang làm bài
                    </span>
                `;
                borderClass = 'border-emerald-200 hover:border-emerald-400';
                break;
            case 'blur':
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Chuyển tab (${student.warnings}/3)
                    </span>
                `;
                borderClass = 'border-amber-300 bg-amber-50/20 hover:border-amber-400';
                break;
            case 'locked':
                statusBadge = `
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
                        <i data-lucide="lock" class="w-3 h-3"></i>
                        Đã khóa bài
                    </span>
                `;
                borderClass = 'border-rose-400 bg-rose-50/40 shadow-sm';
                break;
            case 'submitted':
                statusBadge = `
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                        <i data-lucide="check-circle" class="w-3 h-3"></i>
                        Đã nộp bài
                    </span>
                `;
                borderClass = 'border-indigo-200 hover:border-indigo-300';
                break;
            case 'offline':
            default:
                statusBadge = `
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Chưa tham gia
                    </span>
                `;
                cardBg = 'bg-slate-50/60';
                break;
        }

        const essaySnippetPreview = student.lastEssaySnippet ? `
            <div class="mt-2 text-[11px] text-slate-500 font-mono bg-slate-50 border border-slate-100 p-1.5 rounded truncate">
                <span class="text-indigo-600 font-bold">✍ Tự luận:</span> "${student.lastEssaySnippet}"
            </div>
        ` : '';

        return `
            <div id="monitor-card-${student.sbd}" onclick="window.teacherDashboard.openStudentDrawer('${student.sbd}')"
                class="rounded-xl border ${borderClass} ${cardBg} p-4 cursor-pointer transition shadow-sm hover:shadow-md flex flex-col justify-between">
                
                <div>
                    <!-- Header thẻ học sinh -->
                    <div class="flex items-start justify-between gap-2 mb-3">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 font-mono">
                                ${student.avatar || student.sbd.slice(-2)}
                            </div>
                            <div>
                                <h4 class="font-bold text-sm text-slate-900 leading-tight">${student.name}</h4>
                                <span class="font-mono text-xs text-slate-400">${student.sbd}</span>
                            </div>
                        </div>
                        ${statusBadge}
                    </div>

                    <!-- Thanh tiến độ -->
                    <div class="my-2.5">
                        <div class="flex items-center justify-between text-xs mb-1">
                            <span class="text-slate-500 font-medium">Tiến độ làm bài</span>
                            <span class="font-mono font-bold text-slate-800">${student.progress || 0}%</span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" style="width: ${student.progress || 0}%"></div>
                        </div>
                    </div>

                    ${essaySnippetPreview}
                </div>

                <!-- Footer thẻ -->
                <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Vi phạm: <strong class="${student.warnings > 0 ? 'text-rose-600' : 'text-slate-600'}">${student.warnings || 0}/3</strong></span>
                    <span class="text-blue-600 font-medium hover:underline">Chi tiết &rarr;</span>
                </div>
            </div>
        `;
    }

    updateStatsCounters() {
        const total = this.students.length;
        const active = this.students.filter(s => s.status === 'active').length;
        const warnings = this.students.filter(s => s.status === 'blur' || s.status === 'locked').length;
        const submitted = this.students.filter(s => s.status === 'submitted').length;
        const offline = this.students.filter(s => s.status === 'offline').length;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('stat-total-students', total);
        setVal('stat-active-students', active);
        setVal('stat-warning-students', warnings);
        setVal('stat-submitted-students', submitted);
        setVal('stat-offline-students', offline);
    }

    // ==========================================
    // 4. STUDENT DETAIL DRAWER (LIVE DOCS & ACTIONS)
    // ==========================================
    openStudentDrawer(sbd) {
        const student = this.students.find(s => s.sbd === sbd);
        if (!student) return;

        this.selectedStudent = student;
        const drawer = document.getElementById('student-detail-drawer');
        const overlay = document.getElementById('drawer-overlay');

        if (drawer && overlay) {
            document.getElementById('drawer-student-name').textContent = student.name;
            document.getElementById('drawer-student-sbd').textContent = student.sbd;
            document.getElementById('drawer-student-status').textContent = student.status.toUpperCase();
            document.getElementById('drawer-student-progress').textContent = `${student.progress || 0}%`;
            document.getElementById('drawer-student-warnings').textContent = `${student.warnings || 0}/3`;

            // Nội dung Live Essay Stream
            const liveBox = document.getElementById('drawer-live-essay-content');
            if (liveBox) {
                liveBox.textContent = student.fullEssayText || student.lastEssaySnippet || "(Học sinh chưa bắt đầu gõ phần tự luận hoặc chưa gửi phím bấm)";
            }

            // Nút mở khóa
            const unlockBtn = document.getElementById('drawer-btn-unlock');
            if (unlockBtn) {
                if (student.status === 'locked' || student.warnings > 0) {
                    unlockBtn.classList.remove('hidden');
                    unlockBtn.onclick = () => {
                        window.proctoringService.publish('TEACHER_ACTION', {
                            targetSbd: student.sbd,
                            action: 'UNLOCK'
                        });
                        student.status = 'active';
                        student.warnings = 0;
                        this.saveStudentsToStorage();
                        this.renderSingleCard(student);
                        this.updateStatsCounters();
                        alert(`Đã gửi lệnh MỞ KHÓA bài thi cho học sinh ${student.name} (${student.sbd})!`);
                        this.closeDrawer();
                    };
                } else {
                    unlockBtn.classList.add('hidden');
                }
            }

            // Nút cưỡng chế thu bài (Force Submit)
            const forceSubmitBtn = document.getElementById('drawer-btn-force-submit');
            if (forceSubmitBtn) {
                forceSubmitBtn.onclick = () => {
                    if (confirm(`Bạn có chắc chắn muốn THU BÀI CƯỠNG CHẾ học sinh ${student.name} (${student.sbd})?`)) {
                        window.proctoringService.publish('TEACHER_ACTION', {
                            targetSbd: student.sbd,
                            action: 'FORCE_SUBMIT'
                        });
                        student.status = 'submitted';
                        this.saveStudentsToStorage();
                        this.renderSingleCard(student);
                        this.updateStatsCounters();
                        this.closeDrawer();
                    }
                };
            }

            drawer.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
        }
    }

    closeDrawer() {
        const drawer = document.getElementById('student-detail-drawer');
        const overlay = document.getElementById('drawer-overlay');
        if (drawer && overlay) {
            drawer.classList.add('translate-x-full');
            overlay.classList.add('hidden');
        }
    }

    // ==========================================
    // 5. SHEETJS EXCEL PARSER & CLASS MANAGER
    // ==========================================
    bindSheetJSExcelDropzone() {
        const dropzone = document.getElementById('excel-dropzone');
        const fileInput = document.getElementById('excel-file-input');

        if (dropzone && fileInput) {
            // Drag over / leave
            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add('dropzone-active');
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove('dropzone-active');
                });
            });

            // Handle Drop
            dropzone.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.processExcelFile(files[0]);
                }
            });

            // Handle File Choose
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.processExcelFile(e.target.files[0]);
                }
            });
        }

        // Nút nạp lại dữ liệu 47 học sinh 10A3
        const load10A3Btn = document.getElementById('btn-load-sample-10a3');
        if (load10A3Btn) {
            load10A3Btn.onclick = () => {
                this.students = generateFullClass10A3();
                this.saveStudentsToStorage();
                this.renderClassTable();
                this.updateStatsCounters();
                alert("Đã nạp thành công danh sách 47 học sinh lớp 10A3!");
            };
        }

        // Nút xuất danh sách tài khoản sang Excel
        const exportBtn = document.getElementById('btn-export-excel');
        if (exportBtn) {
            exportBtn.onclick = () => this.exportAccountsToExcel();
        }
    }

    processExcelFile(file) {
        if (!window.XLSX) {
            alert("Thư viện SheetJS chưa được tải!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = window.XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                this.parseExcelRows(jsonData);
            } catch (err) {
                console.error("Lỗi đọc Excel:", err);
                alert("Không thể đọc file Excel/CSV! Vui lòng kiểm tra lại định dạng.");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    parseExcelRows(rows) {
        if (!rows || rows.length < 2) {
            alert("File Excel không có dữ liệu!");
            return;
        }

        // Dòng đầu tiên là header: STT, Mã định danh/SBD, Họ và tên, Lớp...
        const header = rows[0].map(h => (h || '').toString().toLowerCase());
        const sbdIdx = header.findIndex(h => h.includes('sbd') || h.includes('mã') || h.includes('id'));
        const nameIdx = header.findIndex(h => h.includes('tên') || h.includes('họ'));

        const newStudents = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const sbd = row[sbdIdx !== -1 ? sbdIdx : 1] || `SBD${1000 + i}`;
            const name = row[nameIdx !== -1 ? nameIdx : 2] || `Học sinh ${i}`;
            const password = Math.random().toString(36).slice(-6); // Sinh mật khẩu ngẫu nhiên 6 ký tự

            newStudents.push({
                sbd: sbd.toString().trim(),
                name: name.toString().trim(),
                password: password,
                status: 'offline',
                warnings: 0,
                progress: 0,
                pin: '889966',
                avatar: name.slice(0, 2)
            });
        }

        if (newStudents.length > 0) {
            this.students = newStudents;
            this.saveStudentsToStorage();
            this.renderClassTable();
            this.updateStatsCounters();
            alert(`Đã nhập thành công ${newStudents.length} học sinh và sinh tài khoản tự động!`);
        }
    }

    renderClassTable() {
        const tbody = document.getElementById('class-student-table-body');
        const countBadge = document.getElementById('class-count-badge');
        if (countBadge) countBadge.textContent = `${this.students.length} học sinh`;

        if (!tbody) return;

        tbody.innerHTML = this.students.map((s, idx) => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
                <td class="py-3 px-4 font-mono text-slate-500">${idx + 1}</td>
                <td class="py-3 px-4 font-mono font-bold text-slate-800">${s.sbd}</td>
                <td class="py-3 px-4 font-semibold text-slate-900">${s.name}</td>
                <td class="py-3 px-4">
                    <span class="inline-block px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-700 font-medium">
                        ${s.password || 'chem2026'}
                    </span>
                </td>
                <td class="py-3 px-4 font-mono text-blue-600 font-bold">${s.pin}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'locked' ? 'bg-rose-100 text-rose-800' :
                        s.status === 'submitted' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-slate-100 text-slate-600'
                    }">${s.status.toUpperCase()}</span>
                </td>
            </tr>
        `).join('');
    }

    exportAccountsToExcel() {
        if (!window.XLSX) {
            alert("Thư viện SheetJS chưa được nạp!");
            return;
        }

        const data = this.students.map((s, idx) => ({
            "STT": idx + 1,
            "Số Báo Danh (SBD)": s.sbd,
            "Họ và Tên": s.name,
            "Tên đăng nhập": s.sbd,
            "Mật khẩu": s.password || "chem2026",
            "Mã PIN Đề thi": s.pin,
            "Thời gian thi": "50 phút",
            "Trạng thái": s.status
        }));

        const ws = window.XLSX.utils.json_to_sheet(data);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "DanhSachTaiKhoan_10A3");
        window.XLSX.writeFile(wb, "Danh_sach_tai_khoan_thi_Hoa_10A3.xlsx");
    }
}

// Khởi tạo controller
window.teacherDashboard = new TeacherDashboardController();
