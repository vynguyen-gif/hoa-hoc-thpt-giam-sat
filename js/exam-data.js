/**
 * ĐỀ THI MẪU MÔN HÓA HỌC - CHUẨN CẤU TRÚC CÔNG VĂN 7991/BGDĐT
 * Thời gian làm bài: 50 phút
 * Danh pháp: IUPAC 2018 Tiếng Anh (English Chemical Nomenclature)
 */

const EXAM_METADATA = {
    code: "CHEM-7991-A",
    title: "KIỂM TRA ĐÁNH GIÁ ĐỊNH KỲ MÔN HÓA HỌC",
    subtitle: "Cấu trúc đề minh họa theo Công văn 7991 - Bộ Giáo dục và Đào tạo",
    subject: "Hóa học",
    grade: "Lớp 11A1 - Chuẩn IUPAC 2018",
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

    // PHẦN II: TRẮC NGHIỆM ĐÚNG/SAI (4 CÂU)
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

    // PHẦN III: TỰ LUẬN (3 CÂU)
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

// DANH SÁCH 41 HỌC SINH LỚP 11A1 - CỐ ĐỊNH CHUẨN MẬT KHẨU KHÔNG THAY ĐỔI THEO THỜI GIAN
// Đồng bộ 100% giữa Giao diện Giáo viên và Giao diện Học sinh
const INITIAL_STUDENTS_11A1 = [
    { stt: 1, sbd: "11A1_01", sbd_alt: "11A101", name: "Nguyễn Minh An", dob: "09/08/2010", password: "An@167", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NA" },
    { stt: 2, sbd: "11A1_02", sbd_alt: "11A102", name: "Trần Nữ Gia Anh", dob: "22/06/2010", password: "Anh@897", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TA" },
    { stt: 3, sbd: "11A1_03", sbd_alt: "11A103", name: "Trần Lâm Hoài Ân", dob: "22/06/2010", password: "An@132", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TÂ" },
    { stt: 4, sbd: "11A1_04", sbd_alt: "11A104", name: "Nguyễn Công Danh", dob: "14/09/2010", password: "Danh@266", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "ND" },
    { stt: 5, sbd: "11A1_05", sbd_alt: "11A105", name: "Nguyễn Châu Quốc Duy", dob: "23/12/2010", password: "Duy@532", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "ND" },
    { stt: 6, sbd: "11A1_06", sbd_alt: "11A106", name: "Đặng Văn Đạt", dob: "29/03/2010", password: "Dat@332", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "ĐĐ" },
    { stt: 7, sbd: "11A1_07", sbd_alt: "11A107", name: "Trần Quốc Hào", dob: "07/01/2010", password: "Hao@845", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TH" },
    { stt: 8, sbd: "11A1_08", sbd_alt: "11A108", name: "Dương Gia Hân", dob: "12/10/2010", password: "Han@121", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "DH" },
    { stt: 9, sbd: "11A1_09", sbd_alt: "11A109", name: "Lê Gia Hùng", dob: "29/09/2010", password: "Hung@790", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "LH" },
    { stt: 10, sbd: "11A1_10", sbd_alt: "11A110", name: "Nguyễn Lê Quốc Hùng", dob: "01/01/2010", password: "Hung@115", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NH" },
    { stt: 11, sbd: "11A1_11", sbd_alt: "11A111", name: "Trần Nguyễn Anh Khôi", dob: "02/09/2010", password: "Khoi@213", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TK" },
    { stt: 12, sbd: "11A1_12", sbd_alt: "11A112", name: "Trương Quỳnh Mai", dob: "03/03/2010", password: "Mai@792", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TM" },
    { stt: 13, sbd: "11A1_13", sbd_alt: "11A113", name: "Lê Hoàng My", dob: "03/02/2010", password: "My@374", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "LM" },
    { stt: 14, sbd: "11A1_14", sbd_alt: "11A114", name: "Võ Nhật Nam", dob: "20/08/2010", password: "Nam@750", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "VN" },
    { stt: 15, sbd: "11A1_15", sbd_alt: "11A115", name: "Trần Khánh Ngân", dob: "09/03/2010", password: "Ngan@405", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TN" },
    { stt: 16, sbd: "11A1_16", sbd_alt: "11A116", name: "Võ Thị Thu Ngân", dob: "07/10/2010", password: "Ngan@180", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "VN" },
    { stt: 17, sbd: "11A1_17", sbd_alt: "11A117", name: "Lê Yến Nhi", dob: "20/07/2010", password: "Nhi@424", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "LN" },
    { stt: 18, sbd: "11A1_18", sbd_alt: "11A118", name: "Phạm Ngọc Thảo Nhi", dob: "21/03/2010", password: "Nhi@872", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "PN" },
    { stt: 19, sbd: "11A1_19", sbd_alt: "11A119", name: "Trần Ngọc Yến Oanh", dob: "06/11/2010", password: "Oanh@862", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TO" },
    { stt: 20, sbd: "11A1_20", sbd_alt: "11A120", name: "Trần Ngọc Phúc", dob: "30/03/2010", password: "Phuc@189", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TP" },
    { stt: 21, sbd: "11A1_21", sbd_alt: "11A121", name: "Nguyễn Thị Kim Phụng", dob: "03/08/2010", password: "Phung@304", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NP" },
    { stt: 22, sbd: "11A1_22", sbd_alt: "11A122", name: "Đỗ Vũ Kim Phượng", dob: "27/06/2010", password: "Phuong@627", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "ĐP" },
    { stt: 23, sbd: "11A1_23", sbd_alt: "11A123", name: "Nguyễn Thị Thúy Quyên", dob: "10/04/2010", password: "Quyen@410", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NQ" },
    { stt: 24, sbd: "11A1_24", sbd_alt: "11A124", name: "Nguyễn Thị Như Quỳnh", dob: "10/09/2010", password: "Quynh@910", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NQ" },
    { stt: 25, sbd: "11A1_25", sbd_alt: "11A125", name: "Trần Lê Bảo Quỳnh", dob: "08/02/2010", password: "Quynh@208", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TQ" },
    { stt: 26, sbd: "11A1_26", sbd_alt: "11A126", name: "Nguyễn Cao Sang", dob: "02/11/2010", password: "Sang@112", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NS" },
    { stt: 27, sbd: "11A1_27", sbd_alt: "11A127", name: "Võ Nguyễn Minh Sơn", dob: "01/12/2010", password: "Son@121", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "VS" },
    { stt: 28, sbd: "11A1_28", sbd_alt: "11A128", name: "Huỳnh Đặng Thanh Thảo", dob: "31/07/2010", password: "Thao@731", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "HT" },
    { stt: 29, sbd: "11A1_29", sbd_alt: "11A129", name: "Huỳnh Bảo Thi", dob: "04/10/2010", password: "Thi@104", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "HT" },
    { stt: 30, sbd: "11A1_30", sbd_alt: "11A130", name: "Hồ Hữu Kim Thiên", dob: "14/06/2010", password: "Thien@614", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "HT" },
    { stt: 31, sbd: "11A1_31", sbd_alt: "11A131", name: "Cao Tấn Thịnh", dob: "20/05/2010", password: "Thinh@520", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "CT" },
    { stt: 32, sbd: "11A1_32", sbd_alt: "11A132", name: "Nguyễn Thị Ngọc Thịnh", dob: "12/12/2010", password: "Thinh@122", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NT" },
    { stt: 33, sbd: "11A1_33", sbd_alt: "11A133", name: "Nguyễn Võ Cát Tiên", dob: "19/04/2010", password: "Tien@419", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NT" },
    { stt: 34, sbd: "11A1_34", sbd_alt: "11A134", name: "Phạm Thị Thùy Trang", dob: "22/03/2010", password: "Trang@322", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "PT" },
    { stt: 35, sbd: "11A1_35", sbd_alt: "11A135", name: "Trần Phạm Thanh Trúc", dob: "09/08/2010", password: "Truc@809", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TT" },
    { stt: 36, sbd: "11A1_36", sbd_alt: "11A136", name: "Dương Trần Duy Tùng", dob: "25/07/2010", password: "Tung@725", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "DT" },
    { stt: 37, sbd: "11A1_37", sbd_alt: "11A137", name: "Lê Phương Uyên", dob: "16/04/2010", password: "Uyen@416", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "LU" },
    { stt: 38, sbd: "11A1_38", sbd_alt: "11A138", name: "Nguyễn Lương Ngọc Uyên", dob: "11/02/2010", password: "Uyen@211", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NU" },
    { stt: 39, sbd: "11A1_39", sbd_alt: "11A139", name: "Bùi Nguyễn Thi Vũ", dob: "02/01/2010", password: "Vu@102", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "BV" },
    { stt: 40, sbd: "11A1_40", sbd_alt: "11A140", name: "Nguyễn Ngọc Bích Vy", dob: "21/04/2010", password: "Vy@421", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "NV" },
    { stt: 41, sbd: "11A1_41", sbd_alt: "11A141", name: "Trần Thị Phương Vy", dob: "07/07/2010", password: "Vy@707", status: "active", warnings: 0, progress: 0, pin: "889966", avatar: "TV" }
];

function generateClass11A1() {
    return INITIAL_STUDENTS_11A1.map(s => ({
        ...s,
        username: s.sbd,
        status: "active",
        warnings: 0,
        progress: 0,
        currentQuestion: 1,
        lastEssaySnippet: ""
    }));
}
