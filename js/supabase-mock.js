/**
 * SUPABASE & REALTIME PROCTORING BRIDGE
 * Tích hợp Supabase Client và Mock Realtime Engine bằng BroadcastChannel + LocalStorage
 * Đảm bảo đồng bộ thời gian thực giữa giao diện Thí sinh và Bảng Live Monitor Giáo viên
 */

const SUPABASE_CONFIG = {
    // Có thể điền thông tin Supabase thật tại đây nếu có
    url: window.ENV_SUPABASE_URL || "https://mock-chem-exam.supabase.co",
    anonKey: window.ENV_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key",
    channelName: "chem_exam_live_889966"
};

class ProctoringRealtimeService {
    constructor() {
        this.channelName = SUPABASE_CONFIG.channelName;
        this.listeners = new Map();
        this.supabaseClient = null;
        this.initBroadcastChannel();
        this.initSupabaseIfConfigured();
    }

    initBroadcastChannel() {
        if (typeof BroadcastChannel !== 'undefined') {
            this.bc = new BroadcastChannel(this.channelName);
            this.bc.onmessage = (event) => {
                this.handleIncomingMessage(event.data);
            };
        } else {
            // Fallback qua localStorage storage event
            window.addEventListener('storage', (e) => {
                if (e.key === `bc_${this.channelName}` && e.newValue) {
                    try {
                        const data = JSON.parse(e.newValue);
                        this.handleIncomingMessage(data);
                    } catch (err) {
                        console.error("Storage event parse error:", err);
                    }
                }
            });
        }
    }

    initSupabaseIfConfigured() {
        if (window.supabase && SUPABASE_CONFIG.url && !SUPABASE_CONFIG.url.includes("mock-chem-exam")) {
            try {
                this.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                this.realtimeChannel = this.supabaseClient.channel(this.channelName)
                    .on('broadcast', { event: 'proctor_event' }, (payload) => {
                        this.handleIncomingMessage(payload.payload);
                    })
                    .subscribe();
                console.log("[Supabase] Connected to live realtime channel:", this.channelName);
            } catch (err) {
                console.warn("[Supabase] Fallback to internal BroadcastChannel:", err);
            }
        }
    }

    /**
     * Gửi tín hiệu giám sát (Telemetry event)
     */
    publish(eventType, payload) {
        const message = {
            id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: eventType,
            payload,
            timestamp: new Date().toISOString()
        };

        // 1. Gửi qua BroadcastChannel cục bộ
        if (this.bc) {
            this.bc.postMessage(message);
        } else {
            localStorage.setItem(`bc_${this.channelName}`, JSON.stringify(message));
        }

        // 2. Gửi qua Supabase Realtime nếu đã kết nối
        if (this.supabaseClient && this.realtimeChannel) {
            this.realtimeChannel.send({
                type: 'broadcast',
                event: 'proctor_event',
                payload: message
            });
        }

        // 3. Cũng thông báo nội bộ trong tab hiện tại
        this.handleIncomingMessage(message);
    }

    /**
     * Đăng ký lắng nghe sự kiện
     */
    subscribe(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);

        return () => {
            const set = this.listeners.get(eventType);
            if (set) set.delete(callback);
        };
    }

    handleIncomingMessage(message) {
        if (!message || !message.type) return;

        // Gọi listener cho event cụ thể
        const callbacks = this.listeners.get(message.type);
        if (callbacks) {
            callbacks.forEach(cb => {
                try {
                    cb(message.payload, message.timestamp);
                } catch (err) {
                    console.error(`Error in realtime listener for ${message.type}:`, err);
                }
            });
        }

        // Gọi listener cho wildcard '*'
        const wildcard = this.listeners.get('*');
        if (wildcard) {
            wildcard.forEach(cb => cb(message));
        }
    }
}

// Khởi tạo global instance
window.proctoringService = new ProctoringRealtimeService();
