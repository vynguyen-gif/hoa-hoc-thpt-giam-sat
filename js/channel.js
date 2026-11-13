/**
 * REALTIME SYNC BUS - BROADCAST CHANNEL & LOCALSTORAGE
 * Kết nối 2 chiều tức thì (<30ms) giữa màn hình Giáo viên và Học sinh
 */

class ChemSyncChannel {
    constructor(role = "guest") {
        this.role = role;
        this.channelName = "chem_anti_cheat_bus_v1";
        this.listeners = [];

        try {
            this.bc = new BroadcastChannel(this.channelName);
            this.bc.onmessage = (event) => {
                this.handleMessage(event.data);
            };
        } catch (e) {
            console.warn("BroadcastChannel not supported, falling back to localStorage", e);
        }

        // Fallback & multi-window sync qua window.addEventListener('storage')
        window.addEventListener("storage", (event) => {
            if (event.key === "CHEM_EVENT_BUS" && event.newValue) {
                try {
                    const data = JSON.parse(event.newValue);
                    this.handleMessage(data);
                } catch (err) {
                    console.error("Storage event parse error", err);
                }
            }
        });
    }

    send(type, payload = {}) {
        const message = {
            type,
            role: this.role,
            payload,
            timestamp: new Date().toISOString()
        };

        // Gửi qua BroadcastChannel
        if (this.bc) {
            this.bc.postMessage(message);
        }

        // Lưu vào localStorage kích hoạt storage event
        localStorage.setItem("CHEM_EVENT_BUS", JSON.stringify({
            ...message,
            _random: Math.random() // trigger storage event ngay cả khi payload trùng
        }));
    }

    on(type, callback) {
        this.listeners.push({ type, callback });
    }

    handleMessage(data) {
        if (!data || !data.type) return;
        this.listeners.forEach(sub => {
            if (sub.type === "*" || sub.type === data.type) {
                sub.callback(data.payload, data);
            }
        });
    }

    // Helper functions cho giáo viên & học sinh
    getStudents() {
        try {
            return JSON.parse(localStorage.getItem("CHEM_STUDENTS")) || CHEM_DATA.initialStudents;
        } catch (e) {
            return CHEM_DATA.initialStudents;
        }
    }

    saveStudents(students) {
        localStorage.setItem("CHEM_STUDENTS", JSON.stringify(students));
    }

    updateStudent(studentId, updates) {
        const list = this.getStudents();
        const index = list.findIndex(s => s.id === String(studentId));
        if (index !== -1) {
            list[index] = { ...list[index], ...updates };
            this.saveStudents(list);
            return list[index];
        }
        return null;
    }

    getStudentById(studentId) {
        const list = this.getStudents();
        return list.find(s => s.id === String(studentId)) || null;
    }
}

// Khởi tạo global instance
window.chemBus = new ChemSyncChannel();
