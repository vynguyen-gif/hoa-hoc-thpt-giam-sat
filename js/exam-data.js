/**
 * ĐỀ THI MẪU MÔN HÓA HỌC - CHUẨN CẤU TRÚC CÔNG VĂN 7991/BGDĐT
 * Thời gian làm bài: 50 phút
 * Danh pháp: IUPAC 2018 Tiếng Anh (English Chemical Nomenclature)
 * 
 * Cấu trúc:
 * - Phần I: 12 câu trắc nghiệm nhiều phương án lựa chọn (3.0 điểm - mỗi câu 0.25đ)
 * - Phần II: 4 câu trắc nghiệm Đúng/Sai, mỗi câu có 4 ý a, b, c, d (4.0 điểm)
 * - Phần III: 3 câu tự luận / giải thích / tính toán (3.0 điểm)
 */

const EXAM_METADATA = {
    code: "CHEM-7991-A",
    title: "KIỂM TRA ĐÁNH GIÁ ĐỊNH KỲ MÔN HÓA HỌC",
    subtitle: "Cấu trúc đề minh họa theo Công văn 7991 - Bộ Giáo dục và Đào tạo",
    subject: "Hóa học",
    grade: "THPT - Chuẩn IUPAC 2018",
    durationMinutes: 50,
    totalPoints: 10.0,
    pin: "889966", // Mã PIN 6 số truy cập đề thi
    instructions: "Thí sinh không được sử dụng tài liệu. Chế độ giám sát toàn màn hình và chống gian lận được kích hoạt tự động."
};

const EXAM_QUESTIONS = {
    // PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN (12 CÂU)
    part1: [
        {
            id: "p1_q1",
            index: 1,
            type: "single_choice",
            text: "Theo danh pháp IUPAC 2018, hợp chất có công thức hóa học Fe<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub> có tên gọi chuẩn là gì?",
            options: [
                { id: "A", text: "Iron(II) sulfate" },
                { id: "B", text: "Iron(III) sulfate" },
                { id: "C", text: "Diiron trisulfate" },
                { id: "D", text: "Ferric sulfur tetraoxide" }
            ],
            correct: "B",
            points: 0.25,
            topic: "Danh pháp hóa học vô cơ IUPAC"
        },
        {
            id: "p1_q2",
            index: 2,
            type: "single_choice",
            text: "Khí nào sau đây là nguyên nhân chủ yếu gây ra hiện tượng mưa acid khi phản ứng với nước mưa tạo thành dung dịch sulfuric acid (H<sub>2</sub>SO<sub>4</sub>) và nitric acid (HNO<sub>3</sub>)?",
            options: [
                { id: "A", text: "CH<sub>4</sub> và CO" },
                { id: "B", text: "SO<sub>2</sub> và NO<sub>x</sub>" },
                { id: "C", text: "CO<sub>2</sub> và O<sub>2</sub>" },
                { id: "D", text: "N<sub>2</sub> và H<sub>2</sub>" }
            ],
            correct: "B",
            points: 0.25,
            topic: "Hóa học và Môi trường"
        },
        {
            id: "p1_q3",
            index: 3,
            type: "single_choice",
            text: "Số oxi hóa của nguyên tử sulfur (S) trong ion SO<sub>4</sub><sup>2-</sup> là bao nhiêu?",
            options: [
                { id: "A", text: "+4" },
                { id: "B", text: "-2" },
                { id: "C", text: "+6" },
                { id: "D", text: "+2" }
            ],
            correct: "C",
            points: 0.25,
            topic: "Phản ứng oxi hóa - khử"
        },
        {
            id: "p1_q4",
            index: 4,
            type: "single_choice",
            text: "Hydrocarbon nào sau đây thuộc dãy đồng đẳng alkane và là thành phần chính của khí thiên nhiên (natural gas)?",
            options: [
                { id: "A", text: "Methane (CH<sub>4</sub>)" },
                { id: "B", text: "Ethene (C<sub>2</sub>H<sub>4</sub>)" },
                { id: "C", text: "Ethyne (C<sub>2</sub>H<sub>2</sub>)" },
                { id: "D", text: "Benzene (C<sub>6</sub>H<sub>6</sub>)" }
            ],
            correct: "A",
            points: 0.25,
            topic: "Hydrocarbon"
        },
        {
            id: "p1_q5",
            index: 5,
            type: "single_choice",
            text: "Trong pin điện hóa Daniell (Zn - Cu), quá trình xảy ra tại cực âm (anode) là:",
            options: [
                { id: "A", text: "Cu<sup>2+</sup> + 2e<sup>-</sup> &rarr; Cu" },
                { id: "B", text: "Zn &rarr; Zn<sup>2+</sup> + 2e<sup>-</sup>" },
                { id: "C", text: "Cu &rarr; Cu<sup>2+</sup> + 2e<sup>-</sup>" },
                { id: "D", text: "Zn<sup>2+</sup> + 2e<sup>-</sup> &rarr; Zn" }
            ],
            correct: "B",
            points: 0.25,
            topic: "Pin điện hóa & Điện phân"
        },
        {
            id: "p1_q6",
            index: 6,
            type: "single_choice",
            text: "Chất nào sau đây tác dụng với dung dịch AgNO<sub>3</sub> trong NH<sub>3</sub> (thuốc thử Tollens) đun nóng tạo kết tủa bạc trắng sáng (silver mirror test)?",
            options: [
                { id: "A", text: "Ethanol (C<sub>2</sub>H<sub>5</sub>OH)" },
                { id: "B", text: "Ethanal (CH<sub>3</sub>CHO)" },
                { id: "C", text: "Dimethyl ether (CH<sub>3</sub>OCH<sub>3</sub>)" },
                { id: "D", text: "Ethanoic acid (CH<sub>3</sub>COOH)" }
            ],
            correct: "B",
            points: 0.25,
            topic: "Hợp chất carbonyl"
        },
        {
            id: "p1_q7",
            index: 7,
            type: "single_choice",
            text: "Hằng số cân bằng K<sub>C</sub> của phản ứng thuận nghịch phụ thuộc vào yếu tố nào sau đây?",
            options: [
                { id: "A", text: "Nồng độ các chất ban đầu" },
                { id: "B", text: "Chất xúc tác" },
                { id: "C", text: "Nhiệt độ của hệ phản ứng" },
                { id: "D", text: "Áp suất chung của hệ" }
            ],
            correct: "C",
            points: 0.25,
            topic: "Cân bằng hóa học"
        },
        {
            id: "p1_q8",
            index: 8,
            type: "single_choice",
            text: "Cấu hình electron nguyên tử của nguyên tố chlorine (Z = 17) ở trạng thái cơ bản là:",
            options: [
                { id: "A", text: "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>5</sup>" },
                { id: "B", text: "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>1</sup> 3p<sup>6</sup>" },
                { id: "C", text: "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>6</sup>" },
                { id: "D", text: "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>4</sup>" }
            ],
            correct: "A",
            points: 0.25,
            topic: "Cấu tạo nguyên tử"
        },
        {
            id: "p1_q9",
            index: 9,
            type: "single_choice",
            text: "Cho phản ứng tổng hợp ammonia: N<sub>2</sub>(g) + 3H<sub>2</sub>(g) &rightleftharpoons; 2NH<sub>3</sub>(g) &nbsp; (&Delta;<sub>r</sub>H<sup>0</sup><sub>298</sub> = -92 kJ). Biện pháp nào làm cân bằng chuyển dịch theo chiều thuận?",
            options: [
                { id: "A", text: "Tăng nhiệt độ của hệ" },
                { id: "B", text: "Giảm áp suất của hệ" },
                { id: "C", text: "Tăng áp suất chung của hệ" },
                { id: "D", text: "Giảm nồng độ khí N<sub>2</sub>" }
            ],
            correct: "C",
            points: 0.25,
            topic: "Nguyên lí Le Chatelier"
        },
        {
            id: "p1_q10",
            index: 10,
            type: "single_choice",
            text: "Chất béo tristearin có công thức cấu tạo thu gọn là:",
            options: [
                { id: "A", text: "(C<sub>17</sub>H<sub>35</sub>COO)<sub>3</sub>C<sub>3</sub>H<sub>5</sub>" },
                { id: "B", text: "(C<sub>17</sub>H<sub>33</sub>COO)<sub>3</sub>C<sub>3</sub>H<sub>5</sub>" },
                { id: "C", text: "(C<sub>15</sub>H<sub>31</sub>COO)<sub>3</sub>C<sub>3</sub>H<sub>5</sub>" },
                { id: "D", text: "(C<sub>17</sub>H<sub>31</sub>COO)<sub>3</sub>C<sub>3</sub>H<sub>5</sub>" }
            ],
            correct: "A",
            points: 0.25,
            topic: "Lipid & Ester"
        },
        {
            id: "p1_q11",
            index: 11,
            type: "single_choice",
            text: "Dung dịch chất nào sau đây làm quỳ tím chuyển sang màu xanh (pH &gt; 7)?",
            options: [
                { id: "A", text: "Hydrochloric acid (HCl)" },
                { id: "B", text: "Ethanol (C<sub>2</sub>H<sub>5</sub>OH)" },
                { id: "C", text: "Methylamine (CH<sub>3</sub>NH<sub>2</sub>)" },
                { id: "D", text: "Phenol (C<sub>6</sub>H<sub>5</sub>OH)" }
            ],
            correct: "C",
            points: 0.25,
            topic: "Amine - Amino acid"
        },
        {
            id: "p1_q12",
            index: 12,
            type: "single_choice",
            text: "Khi điện phân dung dịch copper(II) sulfate (CuSO<sub>4</sub>) với điện cực trơ, tại anode thu được khí gì?",
            options: [
                { id: "A", text: "Hydrogen (H<sub>2</sub>)" },
                { id: "B", text: "Oxygen (O<sub>2</sub>)" },
                { id: "C", text: "Sulfur dioxide (SO<sub>2</sub>)" },
                { id: "D", text: "Chlorine (Cl<sub>2</sub>)" }
            ],
            correct: "B",
            points: 0.25,
            topic: "Điện phân dung dịch"
        }
    ],

    // PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI (4 CÂU, MỖI CÂU 4 LỆNH HỎI a, b, c, d)
    part2: [
        {
            id: "p2_q1",
            index: 13,
            label: "Câu 1 (Phần II)",
            scenario: "Cho phản ứng nhiệt nhôm dùng để hàn đường ray tàu hỏa: 2Al(s) + Fe<sub>2</sub>O<sub>3</sub>(s) &rarr; Al<sub>2</sub>O<sub>3</sub>(s) + 2Fe(l). Cho biết nhiệt tạo thành chuẩn (&Delta;<sub>f</sub>H<sup>0</sup><sub>298</sub>) của Al<sub>2</sub>O<sub>3</sub>(s) là -1676 kJ/mol và của Fe<sub>2</sub>O<sub>3</sub>(s) là -824 kJ/mol.",
            items: [
                { id: "a", text: "Aluminium (Al) đóng vai trò là chất oxi hóa trong phản ứng trên.", correct: false },
                { id: "b", text: "Biến thiên enthalpy chuẩn của phản ứng là &Delta;<sub>r</sub>H<sup>0</sup><sub>298</sub> = -852 kJ.", correct: true },
                { id: "c", text: "Đây là phản ứng tỏa nhiệt mạnh nên sắt sinh ra ở trạng thái lỏng.", correct: true },
                { id: "d", text: "Nếu dùng 5,4 gam bột Al phản ứng hoàn toàn với lượng dư Fe<sub>2</sub>O<sub>3</sub> thì nhiệt lượng giải phóng ra là 170,4 kJ.", correct: false }
            ]
        },
        {
            id: "p2_q2",
            index: 14,
            label: "Câu 2 (Phần II)",
            scenario: "Tiến hành thí nghiệm điều chế ethyl acetate (CH<sub>3</sub>COOC<sub>2</sub>H<sub>5</sub>) trong phòng thí nghiệm bằng cách đun hồi lưu hỗn hợp gồm ethanol (C<sub>2</sub>H<sub>5</sub>OH), ethanoic acid (CH<sub>3</sub>COOH) và concentrated sulfuric acid (H<sub>2</sub>SO<sub>4</sub> đặc).",
            items: [
                { id: "a", text: "Concentrated sulfuric acid đóng vai trò là chất xúc tác và hút nước để cân bằng chuyển dịch theo chiều tạo ester.", correct: true },
                { id: "b", text: "Phản ứng ester hóa trên là phản ứng thuận nghịch và có hiệu suất phản ứng thường nhỏ hơn 100%.", correct: true },
                { id: "c", text: "Sau khi phản ứng kết thúc, có thể thêm dung dịch NaCl bão hòa để tăng độ tách lớp của ethyl acetate.", correct: true },
                { id: "d", text: "Ethyl acetate chìm xuống dưới đáy ống nghiệm do có khối lượng riêng lớn hơn nước.", correct: false }
            ]
        },
        {
            id: "p2_q3",
            index: 15,
            label: "Câu 3 (Phần II)",
            scenario: "Sulfur dioxide (SO<sub>2</sub>) là một oxide có nhiều ứng dụng trong công nghiệp sản xuất sulfuric acid cũng như làm chất tẩy trắng và chống nấm mốc trong thực phẩm.",
            items: [
                { id: "a", text: "Trong phân tử SO<sub>2</sub>, nguyên tử sulfur ở trạng thái oxi hóa trung gian (+4) nên vừa thể hiện tính khử, vừa thể hiện tính oxi hóa.", correct: true },
                { id: "b", text: "Dẫn khí SO<sub>2</sub> vào dung dịch bromine (Br<sub>2</sub>) làm dung dịch mất màu nâu đỏ do SO<sub>2</sub> khử Br<sub>2</sub> thành HBr.", correct: true },
                { id: "c", text: "Khí SO<sub>2</sub> có mùi hắc đặc trưng, nhẹ hơn không khí nên dễ dàng khuếch tán lên tầng đối lưu.", correct: false },
                { id: "d", text: "Quá trình oxi hóa SO<sub>2</sub> thành SO<sub>3</sub> bằng khí O<sub>2</sub> cần có xúc tác V<sub>2</sub>O<sub>5</sub> ở nhiệt độ thích hợp (450 °C).", correct: true }
            ]
        },
        {
            id: "p2_q4",
            index: 16,
            label: "Câu 4 (Phần II)",
            scenario: "Xét dung dịch đệm và sự thủy phân của các muối trong nước ở 25 °C. Dung dịch sodium acetate (CH<sub>3</sub>COONa) và dung dịch ammonium chloride (NH<sub>4</sub>Cl) đều có nồng độ 0,1 M.",
            items: [
                { id: "a", text: "Dung dịch sodium acetate (CH<sub>3</sub>COONa) có môi trường base (pH &gt; 7) do ion CH<sub>3</sub>COO<sup>-</sup> nhận H<sup>+</sup> của nước.", correct: true },
                { id: "b", text: "Dung dịch ammonium chloride (NH<sub>4</sub>Cl) làm quỳ tím chuyển sang màu xanh do ion Cl<sup>-</sup> thủy phân sinh ra OH<sup>-</sup>.", correct: false },
                { id: "c", text: "Khi thêm một lượng nhỏ dung dịch HCl vào hỗn hợp dung dịch CH<sub>3</sub>COOH và CH<sub>3</sub>COONa thì pH của dung dịch thay đổi không đáng kể.", correct: true },
                { id: "d", text: "Độ điện li của CH<sub>3</sub>COOH trong dung dịch sẽ tăng lên khi nhỏ thêm dung dịch HCl vào.", correct: false }
            ]
        }
    ],

    // PHẦN III: TỰ LUẬN / BÀI TẬP VẬN DỤNG CAO (3 CÂU)
    part3: [
        {
            id: "p3_q1",
            index: 17,
            label: "Câu 1 (Phần III) - 1.0 điểm",
            title: "Tính toán biến thiên enthalpy phản ứng (&Delta;<sub>r</sub>H<sup>0</sup><sub>298</sub>) từ năng lượng liên kết",
            text: `Cho phản ứng cộng hợp hydrogen vào ethylene ở thể khí:
<br/><strong>C<sub>2</sub>H<sub>4</sub>(g) + H<sub>2</sub>(g) &rarr; C<sub>2</sub>H<sub>6</sub>(g)</strong>
<br/>Cho các giá trị năng lượng liên kết trung bình ở điều kiện chuẩn E<sub>b</sub> (kJ/mol):
<ul class="list-disc pl-6 my-2 text-sm text-slate-700">
    <li>E<sub>b</sub>(C=C) = 612 kJ/mol</li>
    <li>E<sub>b</sub>(C-C) = 347 kJ/mol</li>
    <li>E<sub>b</sub>(C-H) = 414 kJ/mol</li>
    <li>E<sub>b</sub>(H-H) = 436 kJ/mol</li>
</ul>
<strong>Yêu cầu:</strong>
<br/>1. Thiết lập công thức và tính biến thiên enthalpy chuẩn (&Delta;<sub>r</sub>H<sup>0</sup><sub>298</sub>) của phản ứng trên.
<br/>2. Cho biết phản ứng trên là tỏa nhiệt hay thu nhiệt? Giải thích ý nghĩa của giá trị biến thiên enthalpy tìm được.`,
            sampleAnswer: "1. ΔrH°298 = [Eb(C=C) + 4Eb(C-H) + Eb(H-H)] - [Eb(C-C) + 6Eb(C-H)] = [612 + 4(414) + 436] - [347 + 6(414)] = (612 + 436) - (347 + 2*414) = 1048 - 1175 = -127 kJ/mol.\n2. Do ΔrH°298 = -127 kJ/mol < 0 nên phản ứng tỏa nhiệt."
        },
        {
            id: "p3_q2",
            index: 18,
            label: "Câu 2 (Phần III) - 1.0 điểm",
            title: "Cân bằng phương trình oxi hóa - khử theo phương pháp thăng bằng electron",
            text: `Lập phương trình hóa học của phản ứng oxi hóa - khử sau theo phương pháp thăng bằng electron:
<br/><strong>KMnO<sub>4</sub> + FeSO<sub>4</sub> + H<sub>2</sub>SO<sub>4</sub> &rarr; K<sub>2</sub>SO<sub>4</sub> + Fe<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub> + MnSO<sub>4</sub> + H<sub>2</sub>O</strong>
<br/><strong>Yêu cầu:</strong>
<br/>1. Xác định số oxi hóa của các nguyên tố thay đổi và chỉ rõ chất khử, chất oxi hóa.
<br/>2. Viết quá trình oxi hóa, quá trình khử và cân bằng phương trình ion thu gọn hoặc phân tử hoàn chỉnh.`,
            sampleAnswer: "1. Chất khử: FeSO4 (Fe+2 -> Fe+3), Chất oxi hóa: KMnO4 (Mn+7 -> Mn+2)\n2. Quá trình khử: Mn+7 + 5e -> Mn+2 (x2)\nQuá trình oxi hóa: 2Fe+2 -> 2Fe+3 + 2e (x5)\nPhương trình hoàn chỉnh: 2KMnO4 + 10FeSO4 + 8H2SO4 -> K2SO4 + 5Fe2(SO4)3 + 2MnSO4 + 8H2O"
        },
        {
            id: "p3_q3",
            index: 19,
            label: "Câu 3 (Phần III) - 1.0 điểm",
            title: "Xác định công thức phân tử hợp chất hữu cơ qua phổ MS và IR",
            text: `Một hợp chất hữu cơ <strong>X</strong> chứa carbon, hydrogen và oxygen có phần trăm khối lượng các nguyên tố lần lượt là: %C = 60,00%; %H = 13,33%; %O = 26,67%.
<br/>- Trên phổ khối lượng (MS) của X, pic ion phân tử [M]<sup>+</sup> có giá trị m/z = 60.
<br/>- Trên phổ hồng ngoại (IR) của X, xuất hiện một tín hiệu hấp thụ mạnh đặc trưng dạng dải rộng ở vùng 3350 cm<sup>-1</sup> (liên kết O-H) và không có tín hiệu hấp thụ ở vùng 1700 - 1750 cm<sup>-1</sup>.
<br/><strong>Yêu cầu:</strong>
<br/>1. Xác định công thức thực nghiệm và công thức phân tử của X.
<br/>2. Viết công thức cấu tạo và gọi tên IUPAC của các đồng phân cấu tạo thỏa mãn phổ IR trên.`,
            sampleAnswer: "1. Đặt CxHyOz -> x:y:z = (60/12) : (13.33/1) : (26.67/16) = 5 : 13.33 : 1.667 = 3 : 8 : 1. CTPT: C3H8O (M = 60).\n2. IR có hấp thụ O-H (3350 cm-1) và không có C=O nên X là alcohol. Các đồng phân: CH3-CH2-CH2-OH (propan-1-ol) và CH3-CH(OH)-CH3 (propan-2-ol)."
        }
    ]
};

// Dữ liệu mock ban đầu cho học sinh lớp 10A3 (47 học sinh)
const INITIAL_STUDENTS_10A3 = [
    { sbd: "10A301", name: "Nguyễn Hoàng An", status: "active", warnings: 0, progress: 85, pin: "889966", currentQuestion: 16, lastEssaySnippet: "ΔrH°298 = [612 + 4(414) + 436] - [347 + 6(414)] = -127 kJ...", avatar: "NH" },
    { sbd: "10A302", name: "Trần Mai Anh", status: "active", warnings: 0, progress: 90, pin: "889966", currentQuestion: 18, lastEssaySnippet: "2KMnO4 + 10FeSO4 + 8H2SO4 -> K2SO4 + 5Fe2(SO4)3...", avatar: "TM" },
    { sbd: "10A303", name: "Lê Quốc Bảo", status: "blur", warnings: 1, progress: 65, pin: "889966", currentQuestion: 11, lastEssaySnippet: "Đang chuyển qua phần tự luận...", avatar: "LQ" },
    { sbd: "10A304", name: "Phạm Gia Bảo", status: "active", warnings: 0, progress: 75, pin: "889966", currentQuestion: 14, lastEssaySnippet: "", avatar: "PG" },
    { sbd: "10A305", name: "Đỗ Ngọc Bích", status: "active", warnings: 0, progress: 95, pin: "889966", currentQuestion: 19, lastEssaySnippet: "CTPT: C3H8O. Tên IUPAC: propan-1-ol và propan-2-ol", avatar: "DN" },
    { sbd: "10A306", name: "Vũ Đình Chiến", status: "locked", warnings: 3, progress: 40, pin: "889966", currentQuestion: 8, lastEssaySnippet: "[Bị khóa bài do chuyển tab quá 3 lần]", avatar: "VD" },
    { sbd: "10A307", name: "Bùi Thùy Dung", status: "active", warnings: 0, progress: 80, pin: "889966", currentQuestion: 15, lastEssaySnippet: "", avatar: "BT" },
    { sbd: "10A308", name: "Ngô Quang Dũng", status: "blur", warnings: 2, progress: 55, pin: "889966", currentQuestion: 10, lastEssaySnippet: "Đang gõ công thức...", avatar: "NQ" },
    { sbd: "10A309", name: "Hoàng Khánh Đan", status: "active", warnings: 0, progress: 88, pin: "889966", currentQuestion: 17, lastEssaySnippet: "Phản ứng tỏa nhiệt vì Delta H < 0", avatar: "HK" },
    { sbd: "10A310", name: "Phan Văn Đạt", status: "offline", warnings: 0, progress: 0, pin: "889966", currentQuestion: 0, lastEssaySnippet: "Chưa tham gia", avatar: "PV" },
    { sbd: "10A311", name: "Lý Mỹ Duyên", status: "active", warnings: 0, progress: 70, pin: "889966", currentQuestion: 13, lastEssaySnippet: "", avatar: "LM" },
    { sbd: "10A312", name: "Dương Minh Đức", status: "active", warnings: 0, progress: 82, pin: "889966", currentQuestion: 16, lastEssaySnippet: "ΔrH°298 = -127 kJ", avatar: "DM" }
];

// Helper để tạo thêm danh sách đầy đủ 47 học sinh nếu cần
function generateFullClass10A3() {
    const list = [...INITIAL_STUDENTS_10A3];
    const familyNames = ["Trịnh", "Lâm", "Hà", "Đặng", "Võ", "Đinh", "Trương", "Lương", "Tạ", "Vương", "Đoàn"];
    const midNames = ["Thị", "Văn", "Đức", "Thanh", "Minh", "Hồng", "Gia", "Tuấn", "Phương"];
    const lastNames = ["Huy", "Khoa", "Lâm", "Mai", "Nam", "Nga", "Phong", "Quân", "Sơn", "Tâm", "Thảo", "Uyên", "Vinh", "Xuân", "Yến"];

    for (let i = 13; i <= 47; i++) {
        const sbd = "10A3" + (i < 10 ? "0" + i : i);
        const fname = familyNames[(i * 3) % familyNames.length];
        const mname = midNames[(i * 2) % midNames.length];
        const lname = lastNames[i % lastNames.length];
        const fullName = `${fname} ${mname} ${lname}`;
        const initials = `${fname[0]}${lname[0]}`;
        
        let status = "active";
        let warnings = 0;
        let progress = Math.min(100, Math.floor(40 + (i * 7) % 58));
        if (i % 9 === 0) {
            status = "blur";
            warnings = 1;
        } else if (i === 22) {
            status = "locked";
            warnings = 3;
        } else if (i % 11 === 0) {
            status = "offline";
            progress = 0;
        }

        list.push({
            sbd,
            name: fullName,
            status,
            warnings,
            progress,
            pin: "889966",
            currentQuestion: Math.floor(progress / 5.5),
            lastEssaySnippet: progress > 60 ? "Lời giải tự luận học sinh đang viết..." : "",
            avatar: initials
        });
    }
    return list;
}
