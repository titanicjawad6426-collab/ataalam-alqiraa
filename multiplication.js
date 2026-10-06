"use strict";

/* =========================================================
   إعدادات اللعبة
========================================================= */

const TOTAL_QUESTIONS = 12;
const MAX_LEVEL = 10;

const PROGRESS_KEY =
    "multiplicationUnlockedLevelV2";

/*
 * عدد خانات العدد العلوي × عدد خانات العدد السفلي
 */
const levelDigits = {
    1: [1, 1],
    2: [2, 1],
    3: [2, 2],
    4: [3, 2],
    5: [3, 3],
    6: [4, 3],
    7: [4, 4],
    8: [5, 4],
    9: [5, 5],
    10: [6, 5]
};


/* =========================================================
   العناصر
========================================================= */

const operationBoard =
    document.getElementById("operationBoard");

const levelTitle =
    document.getElementById("levelTitle");

const questionCounter =
    document.getElementById("questionCounter");

const message =
    document.getElementById("message");

const checkAnswerButton =
    document.getElementById("checkAnswerButton");

const resultCard =
    document.getElementById("resultCard");

const scoreText =
    document.getElementById("scoreText");

const unlockMessage =
    document.getElementById("unlockMessage");

const reviewList =
    document.getElementById("reviewList");

const retryButton =
    document.getElementById("retryButton");

const backButton =
    document.getElementById("backButton");

const celebration =
    document.getElementById("celebration");


/* =========================================================
   المستوى
========================================================= */

const params =
    new URLSearchParams(window.location.search);

let currentLevel =
    parseInt(params.get("level"), 10) || 1;

if (
    currentLevel < 1 ||
    currentLevel > MAX_LEVEL
) {
    currentLevel = 1;
}


/* =========================================================
   المستوى المفتوح
========================================================= */

function getUnlockedLevel() {

    const saved =
        parseInt(
            localStorage.getItem(PROGRESS_KEY),
            10
        );

    if (
        !saved ||
        saved < 1 ||
        saved > MAX_LEVEL
    ) {
        localStorage.setItem(
            PROGRESS_KEY,
            "1"
        );

        return 1;
    }

    return saved;
}


const unlockedLevel =
    getUnlockedLevel();


/*
 * حماية المستوى
 */
if (currentLevel > unlockedLevel) {

    alert(
        "🔒 هذا المستوى مقفل.\nأكمل المستوى السابق أولاً."
    );

    window.location.href =
        "multiplication-levels.html";
}


/* =========================================================
   حالة اللعبة
========================================================= */

let questions = [];

let currentQuestionIndex = 0;

let score = 0;

let currentQuestion = null;

/*
 * هل حدث خطأ في أي خطوة من العملية الحالية؟
 */
let currentQuestionHadError = false;


/*
 * المرحلة الحالية:
 *
 * partial
 * = نتيجة جزئية
 *
 * final
 * = النتيجة النهائية
 */
let currentStage = "final";


/*
 * رقم النتيجة الجزئية الحالية.
 */
let currentPartialIndex = 0;


/*
 * بيانات إدخال الأرقام.
 *
 * مثال:
 * result = 312
 *
 * values:
 * ["", "", ""]
 *
 * currentSlot = 2
 *
 * أي نبدأ من أقصى اليمين.
 */
let answerValues = [];

let currentSlot = -1;


/* =========================================================
   أدوات الأرقام
========================================================= */

function randomInt(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


function minForDigits(digits) {

    if (digits === 1) {
        return 1;
    }

    return Math.pow(10, digits - 1);
}


function maxForDigits(digits) {

    return Math.pow(10, digits) - 1;
}


function generateNumber(digits) {

    return randomInt(
        minForDigits(digits),
        maxForDigits(digits)
    );
}


/* =========================================================
   توليد العمليات
========================================================= */

function generateQuestions() {

    const result = [];

    const used = new Set();

    const [
        topDigits,
        bottomDigits
    ] = levelDigits[currentLevel];

    while (
        result.length < TOTAL_QUESTIONS
    ) {

        const a =
            generateNumber(topDigits);

        const b =
            generateNumber(bottomDigits);

        /*
         * منع تكرار العملية.
         */
        const key =
            `${a}x${b}`;

        if (used.has(key)) {
            continue;
        }

        /*
         * إذا كان العددان لهما نفس عدد الخانات
         * لا نريد تكرارًا معكوسًا:
         *
         * 24 × 31
         * 31 × 24
         *
         * يعتبران نفس العملية من ناحية التدريب.
         */
        if (topDigits === bottomDigits) {

            const reverseKey =
                `${b}x${a}`;

            if (used.has(reverseKey)) {
                continue;
            }
        }

        used.add(key);

        result.push({
            a,
            b,
            product: a * b
        });
    }

    return result;
}


/* =========================================================
   تحديد هل الضرب يحتاج خطوات جزئية
========================================================= */

function hasPartialSteps() {

    return (
        String(currentQuestion.b).length > 1
    );
}


/* =========================================================
   الحصول على النتائج الجزئية
========================================================= */

function getPartialProducts() {

    const digits =
        String(currentQuestion.b)
            .split("")
            .reverse();

    const partials = [];

    digits.forEach(
        (digit, index) => {

            const value =
                currentQuestion.a *
                Number(digit);

            partials.push({
                value,
                shift: index
            });
        }
    );

    return partials;
}


/* =========================================================
   بناء أعمدة العملية
========================================================= */

/*
 * نستخدم 5 أعمدة رقمية ثابتة:
 *
 * col 1
 * col 2
 * col 3
 * col 4
 * col 5
 *
 * والوحدات دائماً في col 5.
 *
 * بهذه الطريقة لا تعتمد المحاذاة على عدد
 * المسافات في النص.
 */

function getDigitColumns() {

    return [
        2,
        3,
        4,
        5,
        6
    ];
}


function getDigitsRightAligned(
    number,
    width = 5
) {

    const str =
        String(number);

    const arr =
        new Array(width).fill("");

    const start =
        width - str.length;

    for (
        let i = 0;
        i < str.length;
        i++
    ) {
        arr[start + i] =
            str[i];
    }

    return arr;
}


/*
 * إنشاء صف أرقام عادي.
 */
function addNumberRow(
    number,
    extraClass = ""
) {

    const digits =
        getDigitsRightAligned(number);

    digits.forEach(
        (digit, index) => {

            const cell =
                document.createElement("div");

            cell.className =
                `digit ${extraClass}`;

            cell.style.gridColumn =
                String(
                    getDigitColumns()[index]
                );

            cell.textContent =
                digit;

            operationBoard.appendChild(cell);
        }
    );
}


/*
 * صف العدد الثاني مع علامة ×
 *
 * مثال:
 *
 *        2 4
 *      × 1 3
 */
function addMultiplierRow() {

    const digits =
        getDigitsRightAligned(
            currentQuestion.b
        );

    /*
     * علامة الضرب في العمود الذي قبل
     * بداية الأرقام.
     */
    const symbol =
        document.createElement("div");

    symbol.className =
        "multiply-symbol";

    symbol.textContent = "×";

    symbol.style.gridColumn = "3";

    operationBoard.appendChild(symbol);


    digits.forEach(
        (digit, index) => {

            const cell =
                document.createElement("div");

            cell.className =
                "digit";

            cell.style.gridColumn =
                String(
                    getDigitColumns()[index]
                );

            cell.textContent =
                digit;

            operationBoard.appendChild(cell);
        }
    );
}


/* =========================================================
   خط الفصل
========================================================= */

function addLine() {

    const line =
        document.createElement("div");

    line.className =
        "operation-line";

    operationBoard.appendChild(line);
}


/* =========================================================
   إنشاء خانات إدخال رقم
========================================================= */

function createAnswerRow(
    expectedLength,
    values,
    activeIndex
) {

    const columns =
        getDigitColumns();

    const width =
        columns.length;

    /*
     * نرسم خمس خانات ثابتة.
     *
     * الوحدات دائماً في أقصى اليمين.
     */
    for (
        let i = 0;
        i < width;
        i++
    ) {

        const cell =
            document.createElement("div");

        /*
         * العمود الخاص بالخانة.
         */
        cell.style.gridColumn =
            String(columns[i]);

        /*
         * عدد الخانات الفعلية للنتيجة
         * يبدأ من اليمين.
         */
        const answerStart =
            width - expectedLength;

        if (i < answerStart) {

            cell.className =
                "partial-empty";

            operationBoard.appendChild(cell);

            continue;
        }


        /*
         * index داخل answerValues
         */
        const valueIndex =
            i - answerStart;


        /*
         * إذا تم إدخال الرقم سابقاً
         */
        if (
            values[valueIndex] !== ""
        ) {

            cell.className =
                "answer-digit";

            cell.textContent =
                values[valueIndex];

            operationBoard.appendChild(cell);

            continue;
        }


        /*
         * الخانة الحالية النشطة.
         */
        if (
            valueIndex === activeIndex
        ) {

            const input =
                document.createElement("input");

            input.className =
                "answer-slot";

            input.type =
                "text";

            input.inputMode =
                "numeric";

            input.maxLength = 1;

            input.autocomplete =
                "off";

            input.setAttribute(
                "aria-label",
                "أدخل الرقم"
            );

            input.dataset.index =
                String(valueIndex);

            input.addEventListener(
                "input",
                handleDigitInput
            );

            cell.appendChild(input);

            operationBoard.appendChild(cell);

            /*
             * نركز تلقائياً.
             */
            setTimeout(
                () => input.focus(),
                30
            );

            continue;
        }


        /*
         * الخانات المتبقية تظهر كنقاط.
         */
        cell.className =
            "answer-dot";

        cell.textContent =
            "•";

        operationBoard.appendChild(cell);
    }
}


/* =========================================================
   معالجة إدخال رقم
========================================================= */

function handleDigitInput(event) {

    const input =
        event.target;

    let value =
        input.value
            .replace(/\D/g, "");

    if (value.length > 1) {
        value =
            value.charAt(0);
    }

    input.value =
        value;

    if (!value) {
        return;
    }

    const index =
        parseInt(
            input.dataset.index,
            10
        );

    answerValues[index] =
        value;

    /*
     * الانتقال من اليمين إلى اليسار.
     */
    currentSlot =
        index - 1;

    /*
     * إذا انتهت الخانات:
     * لا ننتقل حتى يضغط الطفل على تحقق.
     */
    renderCurrentStep();
}


/* =========================================================
   عرض العملية
========================================================= */

function renderOperation() {

    operationBoard.innerHTML = "";

    /*
     * العدد العلوي
     */
    addNumberRow(
        currentQuestion.a
    );


    /*
     * العدد السفلي
     */
    addMultiplierRow();


    /*
     * خط واحد
     */
    addLine();


    /*
     * إذا كان الضرب من رقم واحد:
     * ندخل النتيجة مباشرة.
     */
    if (!hasPartialSteps()) {

        currentStage =
            "final";

        renderAnswerArea(
            currentQuestion.product
        );

        return;
    }


    /*
     * ضرب متعدد الأرقام:
     * نبدأ بالرقم الموجود في الوحدات.
     */
    currentStage =
        "partial";

    currentPartialIndex =
        0;

    renderPartialStep();
}


/* =========================================================
   عرض النتيجة الجزئية
========================================================= */

function renderPartialStep() {

    const partials =
        getPartialProducts();

    const partial =
        partials[currentPartialIndex];

    /*
     * نحتاج إلى إدخال نتيجة هذه العملية.
     */
    const expected =
        String(partial.value);

    answerValues =
        new Array(
            expected.length
        ).fill("");

    currentSlot =
        expected.length - 1;

    renderCurrentStep();
}


/* =========================================================
   عرض الخطوة الحالية
========================================================= */

function renderCurrentStep() {

    /*
     * إعادة بناء العملية.
     */
    operationBoard.innerHTML = "";

    addNumberRow(
        currentQuestion.a
    );

    addMultiplierRow();

    addLine();


    if (
        currentStage === "partial"
    ) {

        renderPartialRowsBeforeCurrent();

        /*
         * إضافة النتيجة الجزئية الحالية.
         */
        renderCurrentAnswerRow();

        return;
    }


    /*
     * النتيجة النهائية.
     */
    renderFinalAnswerRow();
}


/* =========================================================
   عرض النتائج الجزئية السابقة
========================================================= */

function renderPartialRowsBeforeCurrent() {

    const partials =
        getPartialProducts();

    /*
     * النتائج السابقة فقط.
     */
    for (
        let i = 0;
        i < currentPartialIndex;
        i++
    ) {

        renderFixedPartial(
            partials[i].value,
            partials[i].shift
        );
    }
}


/* =========================================================
   رسم نتيجة جزئية مكتملة
========================================================= */

function renderFixedPartial(
    value,
    shift
) {

    const digits =
        String(value)
            .split("");

    const columns =
        getDigitColumns();

    /*
     * الإزاحة المدرسية:
     *
     * النتيجة الأولى:
     *      72
     *
     * النتيجة الثانية:
     *    24
     *
     * أي أن السطر الثاني ينتقل
     * خانة إلى اليسار.
     */

    const rightMostColumn =
        columns[columns.length - 1];

    const shiftAmount =
        shift;


    digits.forEach(
        (digit, index) => {

            const positionFromRight =
                digits.length -
                1 -
                index;

            const columnIndex =
                columns.length -
                1 -
                positionFromRight -
                shiftAmount;

            if (
                columnIndex < 0
            ) {
                return;
            }

            const cell =
                document.createElement("div");

            cell.className =
                "partial-digit";

            cell.style.gridColumn =
                String(
                    columns[columnIndex]
                );

            cell.textContent =
                digit;

            operationBoard.appendChild(cell);
        }
    );
}


/* =========================================================
   رسم خانة النتيجة الحالية
========================================================= */

function renderCurrentAnswerRow() {

    const partials =
        getPartialProducts();

    const partial =
        partials[currentPartialIndex];

    const expected =
        String(partial.value);

    /*
     * النتيجة الجزئية يجب أن تكون مزاحة
     * حسب موقع الرقم المضروب.
     */
    const shift =
        partial.shift;

    renderShiftedAnswer(
        expected,
        shift
    );
}


/* =========================================================
   رسم نتيجة مزاحة مع نقاط ومربع
========================================================= */

function renderShiftedAnswer(
    expected,
    shift
) {

    const columns =
        getDigitColumns();

    const digits =
        expected.split("");

    const width =
        columns.length;

    /*
     * موضع كل رقم.
     */
    digits.forEach(
        (digit, index) => {

            const positionFromRight =
                digits.length -
                1 -
                index;

            const columnIndex =
                width -
                1 -
                positionFromRight -
                shift;

            if (
                columnIndex < 0
            ) {
                return;
            }

            const cell =
                document.createElement("div");

            cell.style.gridColumn =
                String(
                    columns[columnIndex]
                );


            /*
             * index داخل answerValues
             */
            const answerIndex =
                index;


            if (
                answerValues[answerIndex] !== ""
            ) {

                cell.className =
                    "answer-digit";

                cell.textContent =
                    answerValues[answerIndex];

            } else if (
                answerIndex === currentSlot
            ) {

                const input =
                    document.createElement("input");

                input.className =
                    "answer-slot";

                input.type =
                    "text";

                input.inputMode =
                    "numeric";

                input.maxLength = 1;

                input.autocomplete =
                    "off";

                input.dataset.index =
                    String(answerIndex);

                input.addEventListener(
                    "input",
                    handleDigitInput
                );

                cell.appendChild(input);

                setTimeout(
                    () => input.focus(),
                    30
                );

            } else {

                cell.className =
                    "answer-dot";

                cell.textContent =
                    "•";
            }

            operationBoard.appendChild(cell);
        }
    );
}


/* =========================================================
   النتيجة النهائية
========================================================= */

function renderFinalAnswerRow() {

    const expected =
        String(
            currentQuestion.product
        );

    const columns =
        getDigitColumns();

    const digits =
        expected.split("");

    const width =
        columns.length;

    digits.forEach(
        (digit, index) => {

            const positionFromRight =
                digits.length -
                1 -
                index;

            const columnIndex =
                width -
                1 -
                positionFromRight;

            const cell =
                document.createElement("div");

            cell.style.gridColumn =
                String(
                    columns[columnIndex]
                );

            if (
                answerValues[index] !== ""
            ) {

                cell.className =
                    "answer-digit";

                cell.textContent =
                    answerValues[index];

            } else if (
                index === currentSlot
            ) {

                const input =
                    document.createElement("input");

                input.className =
                    "answer-slot";

                input.type =
                    "text";

                input.inputMode =
                    "numeric";

                input.maxLength = 1;

                input.autocomplete =
                    "off";

                input.dataset.index =
                    String(index);

                input.addEventListener(
                    "input",
                    handleDigitInput
                );

                cell.appendChild(input);

                setTimeout(
                    () => input.focus(),
                    30
                );

            } else {

                cell.className =
                    "answer-dot";

                cell.textContent =
                    "•";
            }

            operationBoard.appendChild(cell);
        }
    );
}


/* =========================================================
   التحقق
========================================================= */

function checkAnswer() {

    /*
     * هل كل الخانات مكتملة؟
     */
    if (
        answerValues.length === 0 ||
        answerValues.some(
            value => value === ""
        )
    ) {

        showMessage(
            "✏️ أكمل كتابة النتيجة أولاً.",
            "orange"
        );

        return;
    }


    const userAnswer =
        answerValues.join("");


    /*
     * الخطوة الجزئية
     */
    if (
        currentStage === "partial"
    ) {

        const partials =
            getPartialProducts();

        const expected =
            String(
                partials[
                    currentPartialIndex
                ].value
            );


        if (
            userAnswer !== expected
        ) {

            currentQuestionHadError =
                true;

            showMessage(
                `❌ غير صحيح. النتيجة الصحيحة هي ${expected}`,
                "red"
            );

            setTimeout(
                () => {

                    /*
                     * إعادة نفس الخطوة
                     * مع تسجيل الخطأ.
                     */
                    answerValues =
                        new Array(
                            expected.length
                        ).fill("");

                    currentSlot =
                        expected.length - 1;

                    renderCurrentStep();

                },
                900
            );

            return;
        }


        /*
         * الخطوة صحيحة.
         */
        showMessage(
            "✅ صحيح!",
            "green"
        );


        setTimeout(
            () => {

                currentPartialIndex++;

                if (
                    currentPartialIndex <
                    partials.length
                ) {

                    /*
                     * الانتقال للنتيجة الجزئية التالية.
                     */
                    renderPartialStep();

                } else {

                    /*
                     * انتهت النتائج الجزئية.
                     * الآن نطلب النتيجة النهائية.
                     */
                    currentStage =
                        "final";

                    answerValues =
                        new Array(
                            String(
                                currentQuestion.product
                            ).length
                        ).fill("");

                    currentSlot =
                        answerValues.length - 1;

                    renderCurrentStep();
                }

            },
            600
        );

        return;
    }


    /*
     * التحقق من النتيجة النهائية.
     */
    const expectedFinal =
        String(
            currentQuestion.product
        );


    if (
        userAnswer !== expectedFinal
    ) {

        currentQuestionHadError =
            true;

        showMessage(
            `❌ غير صحيح. النتيجة الصحيحة هي ${expectedFinal}`,
            "red"
        );

        setTimeout(
            () => {

                answerValues =
                    new Array(
                        expectedFinal.length
                    ).fill("");

                currentSlot =
                    expectedFinal.length - 1;

                renderCurrentStep();

            },
            900
        );

        return;
    }


    /*
     * النتيجة صحيحة.
     */
    showMessage(
        "🎉 صحيح!",
        "green"
    );


    /*
     * العملية لا تحسب صحيحة إلا إذا
     * لم يرتكب الطفل أي خطأ في أي خطوة.
     */
    if (
        !currentQuestionHadError
    ) {

        score++;
    }


    saveQuestionResult();

    setTimeout(
        nextQuestion,
        700
    );
}


/* =========================================================
   نتيجة العملية
========================================================= */

const questionResults = [];


function saveQuestionResult() {

    questionResults.push({
        a: currentQuestion.a,
        b: currentQuestion.b,
        product: currentQuestion.product,
        correct:
            !currentQuestionHadError
    });
}


/* =========================================================
   العملية التالية
========================================================= */

function nextQuestion() {

    currentQuestionIndex++;

    if (
        currentQuestionIndex >=
        TOTAL_QUESTIONS
    ) {

        finishLevel();

        return;
    }


    startQuestion();
}


/* =========================================================
   بدء عملية
========================================================= */

function startQuestion() {

    currentQuestion =
        questions[
            currentQuestionIndex
        ];

    currentQuestionHadError =
        false;

    currentStage =
        "final";

    currentPartialIndex =
        0;

    answerValues = [];

    currentSlot = -1;

    message.textContent = "";

    message.style.color = "";

    questionCounter.textContent =
        `العملية ${
            currentQuestionIndex + 1
        } من ${TOTAL_QUESTIONS}`;

    renderOperation();
}


/* =========================================================
   الرسائل
========================================================= */

function showMessage(
    text,
    color
) {

    message.textContent =
        text;

    if (color === "green") {
        message.style.color =
            "#16833b";
    }

    if (color === "red") {
        message.style.color =
            "#d62828";
    }

    if (color === "orange") {
        message.style.color =
            "#d97706";
    }
}


/* =========================================================
   إنهاء المستوى
========================================================= */

function finishLevel() {

    checkAnswerButton.style.display =
        "none";

    operationBoard.style.display =
        "none";

    message.style.display =
        "none";

    questionCounter.style.display =
        "none";


    scoreText.textContent =
        `نتيجتك: ${score} / ${TOTAL_QUESTIONS}`;


    reviewList.innerHTML = "";


    questionResults.forEach(
        (item, index) => {

            const div =
                document.createElement("div");

            div.className =
                "review-item " +
                (
                    item.correct
                        ? "review-correct"
                        : "review-wrong"
                );

            div.textContent =
                `${index + 1}. ${item.a} × ${item.b} = ${item.product} ` +
                (
                    item.correct
                        ? "✓"
                        : "✗"
                );

            reviewList.appendChild(div);
        }
    );


    /*
     * فتح المستوى التالي فقط إذا كانت
     * جميع العمليات صحيحة.
     */
    if (
        score === TOTAL_QUESTIONS
    ) {

        if (
            currentLevel <
            MAX_LEVEL
        ) {

            const newUnlocked =
                Math.max(
                    getUnlockedLevel(),
                    currentLevel + 1
                );

            localStorage.setItem(
                PROGRESS_KEY,
                String(newUnlocked)
            );

            unlockMessage.innerHTML =
                `<p>🔓 تم فتح المستوى ${
                    currentLevel + 1
                }!</p>`;

        } else {

            unlockMessage.innerHTML =
                `<p>🏆 ممتاز! لقد أكملت جميع مستويات الضرب!</p>`;
        }


        celebrate();

    } else {

        unlockMessage.innerHTML =
            `<p>
                🔒 أكمل 12/12 بشكل صحيح لفتح المستوى التالي.
             </p>`;
    }


    resultCard.classList.add("show");
}


/* =========================================================
   الاحتفال
========================================================= */

function celebrate() {

    celebration.classList.add("show");


    /*
     * نجوم طائرة.
     */
    for (
        let i = 0;
        i < 24;
        i++
    ) {

        const star =
            document.createElement("div");

        star.className =
            "star";

        star.textContent =
            "⭐";

        star.style.left =
            "50%";

        star.style.top =
            "50%";

        const x =
            randomInt(-250, 250);

        const y =
            randomInt(-300, 300);

        star.style.setProperty(
            "--x",
            `${x}px`
        );

        star.style.setProperty(
            "--y",
            `${y}px`
        );

        document.body.appendChild(star);


        setTimeout(
            () => star.remove(),
            1600
        );
    }


    playApplause();


    setTimeout(
        () => {

            celebration.classList.remove(
                "show"
            );

        },
        1800
    );
}


/* =========================================================
   صوت التصفيق
========================================================= */

function playApplause() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const audio =
            new AudioContext();

        const now =
            audio.currentTime;


        for (
            let i = 0;
            i < 10;
            i++
        ) {

            const oscillator =
                audio.createOscillator();

            const gain =
                audio.createGain();

            oscillator.type =
                "triangle";

            oscillator.frequency.value =
                500 +
                Math.random() * 800;

            gain.gain.setValueAtTime(
                0,
                now + i * 0.08
            );

            gain.gain.linearRampToValueAtTime(
                0.15,
                now +
                    i * 0.08 +
                    0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now +
                    i * 0.08 +
                    0.12
            );

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start(
                now + i * 0.08
            );

            oscillator.stop(
                now + i * 0.08 + 0.13
            );
        }

    } catch (error) {

        console.log(
            "Audio unavailable:",
            error
        );
    }
}


/* =========================================================
   إعادة المستوى
========================================================= */

retryButton.addEventListener(
    "click",
    () => {

        window.location.href =
            `multiplication.html?level=${currentLevel}&v=${Date.now()}`;
    }
);


/* =========================================================
   العودة
========================================================= */

backButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "multiplication-levels.html";
    }
);


/* =========================================================
   زر التحقق
========================================================= */

checkAnswerButton.addEventListener(
    "click",
    checkAnswer
);


/* =========================================================
   زر Enter
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            /*
             * إذا كان التركيز داخل input
             * والنتيجة مكتملة، نفذ تحقق.
             */
            if (
                document.activeElement &&
                document.activeElement.tagName ===
                    "INPUT"
            ) {

                checkAnswer();
            }
        }
    }
);


/* =========================================================
   بدء اللعبة
========================================================= */

levelTitle.textContent =
    `المستوى ${currentLevel}`;

questions =
    generateQuestions();

questionResults.length = 0;

score = 0;

currentQuestionIndex = 0;

startQuestion();
