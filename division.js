"use strict";

/*
========================================
تعلم القسمة
نظام القسمة العمودية المدرسية
========================================
*/

const TOTAL_QUESTIONS = 12;
const MAX_LEVEL = 10;

const PROGRESS_KEY = "divisionUnlockedLevelV1";

const params = new URLSearchParams(location.search);

let level = Number(params.get("level")) || 1;

if (level < 1) level = 1;
if (level > MAX_LEVEL) level = MAX_LEVEL;


/*
========================================
عدد أرقام المقسوم والمقسوم عليه
========================================
*/

const levelDigits = {
    1: [2, 1],
    2: [3, 1],
    3: [3, 1],
    4: [4, 1],
    5: [4, 2],
    6: [5, 1],
    7: [5, 2],
    8: [6, 2],
    9: [6, 2],
    10: [7, 2]
};


/*
========================================
حالة اللعبة
========================================
*/

let currentQuestion = 0;
let score = 0;

let currentProblem = null;
let currentSteps = [];

let currentStepIndex = 0;


/*
========================================
العناصر
========================================
*/

const board = document.getElementById("divisionBoard");

const levelNumber =
    document.getElementById("levelNumber");

const questionNumber =
    document.getElementById("questionNumber");

const stepLabel =
    document.getElementById("stepLabel");

const instruction =
    document.getElementById("instruction");

const answerInput =
    document.getElementById("answerInput");

const checkButton =
    document.getElementById("checkButton");

const message =
    document.getElementById("message");

const finishCard =
    document.getElementById("finishCard");

const finishTitle =
    document.getElementById("finishTitle");

const finishText =
    document.getElementById("finishText");


/*
========================================
توليد رقم عشوائي
========================================
*/

function randomInt(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}


/*
========================================
توليد عدد بعدد أرقام محدد
========================================
*/

function randomNumber(digits) {

    const min =
        digits === 1
            ? 1
            : Math.pow(10, digits - 1);

    const max =
        Math.pow(10, digits) - 1;

    return randomInt(min, max);
}


/*
========================================
إنشاء عملية قسمة
يجب أن يكون المقسوم أكبر من المقسوم عليه
========================================
*/

function generateProblem() {

    const [dividendDigits, divisorDigits] =
        levelDigits[level];

    let dividend;
    let divisor;

    do {

        dividend =
            randomNumber(dividendDigits);

        divisor =
            randomNumber(divisorDigits);

    } while (
        divisor === 0 ||
        divisor >= dividend
    );

    return {
        dividend,
        divisor
    };
}


/*
========================================
القسمة الطويلة الحقيقية

نحن لا نعرض فقط الناتج النهائي.
بل نبني جميع خطوات القسمة.
========================================
*/

function buildDivisionSteps(dividend, divisor) {

    const digits =
        String(dividend)
            .split("")
            .map(Number);

    const quotientDigits = [];

    const steps = [];

    let current = 0;

    for (let i = 0; i < digits.length; i++) {

        current =
            current * 10 + digits[i];

        /*
        إذا كان العدد الحالي أصغر من المقسوم عليه
        نضع صفرًا في الناتج فقط عندما نكون قد بدأنا
        */
        if (current < divisor) {

            if (quotientDigits.length > 0) {

                quotientDigits.push(0);

            }

            continue;
        }

        const quotientDigit =
            Math.floor(current / divisor);

        const product =
            quotientDigit * divisor;

        const remainder =
            current - product;

        quotientDigits.push(quotientDigit);

        /*
        موقع الأرقام التي استعملناها
        */
        const usedStart =
            i - String(current).length + 1;

        steps.push({

            type: "division",

            index: i,

            current,

            quotientDigit,

            product,

            remainder,

            broughtDigit:
                i + 1 < digits.length
                    ? digits[i + 1]
                    : null,

            /*
            الخطوات المطلوبة من الطفل
            */
            answers: [

                {
                    type: "quotient",
                    value: quotientDigit,
                    text:
                        `${current} ÷ ${divisor} = ؟`
                },

                {
                    type: "product",
                    value: product,
                    text:
                        `${quotientDigit} × ${divisor} = ؟`
                },

                {
                    type: "remainder",
                    value: remainder,
                    text:
                        `${current} − ${product} = ؟`
                }

            ]

        });

        current = remainder;
    }


    const quotient =
        quotientDigits.join("");

    return {

        dividend,

        divisor,

        quotient,

        remainder: current,

        steps

    };
}


/*
========================================
بناء قائمة خطوات الطفل
========================================
*/

function createStudentSteps(problem) {

    const result =
        buildDivisionSteps(
            problem.dividend,
            problem.divisor
        );

    const studentSteps = [];

    result.steps.forEach((step, index) => {

        studentSteps.push({

            type: "quotient",

            value: step.quotientDigit,

            divisionStep: index,

            text:
                `${step.current} ÷ ${problem.divisor} = ؟`

        });


        studentSteps.push({

            type: "product",

            value: step.product,

            divisionStep: index,

            text:
                `${step.quotientDigit} × ${problem.divisor} = ؟`

        });


        studentSteps.push({

            type: "remainder",

            value: step.remainder,

            divisionStep: index,

            text:
                `${step.current} − ${step.product} = ؟`

        });

    });

    return {

        result,

        studentSteps

    };
}


/*
========================================
إنشاء خلية رقم
========================================
*/

function createCell(value = "") {

    const cell =
        document.createElement("div");

    cell.className = "cell";

    cell.textContent =
        value === null ||
        value === undefined
            ? ""
            : value;

    return cell;
}


/*
========================================
رسم رأس القسمة
========================================
*/

function renderHeader(problem, result) {

    board.innerHTML = "";

    const top =
        document.createElement("div");

    top.className =
        "division-top";

    const dividend =
        document.createElement("div");

    dividend.className =
        "dividend";

    String(problem.dividend)
        .split("")
        .forEach((digit, index) => {

            const cell =
                document.createElement("div");

            cell.className =
                "digit";

            cell.textContent =
                digit;

            /*
            تخزين رقم المقسوم
            حتى نستطيع إظهار سهم الإنزال
            من الرقم نفسه.
            */

            cell.dataset.index =
                index;

            dividend.appendChild(cell);

        });


    const symbol =
        document.createElement("div");

    symbol.className =
        "division-symbol";


    const divisor =
        document.createElement("div");

    divisor.className =
        "divisor";

    divisor.textContent =
        problem.divisor;

    symbol.appendChild(divisor);


    top.appendChild(dividend);
    top.appendChild(symbol);

    board.appendChild(top);


    /*
    حاصل القسمة
    */

    const quotient =
        document.createElement("div");

    quotient.className =
        "quotient";

    String(result.quotient)
        .split("")
        .forEach(digit => {

            const cell =
                document.createElement("div");

            cell.className =
                "q-digit";

            cell.textContent =
                digit;

            quotient.appendChild(cell);

        });

    board.appendChild(quotient);
}


/*
========================================
إنشاء سطر خطوات فارغ
========================================
*/

function createStepRow(text, startColumn) {

    const row =
        document.createElement("div");

    row.className =
        "division-step";

    const totalColumns =
        Math.max(
            currentProblem.dividend.toString().length + 2,
            7
        );

    row.style.setProperty(
        "--columns",
        totalColumns
    );

    for (let i = 0; i < totalColumns; i++) {

        row.appendChild(
            createCell("")
        );

    }

    /*
    وضع النص في الخلايا
    */

    const chars =
        String(text).split("");

    chars.forEach((char, i) => {

        const column =
            startColumn + i;

        if (
            column >= 0 &&
            column < row.children.length
        ) {

            row.children[column]
                .textContent = char;

        }

    });

    return row;
}


/*
========================================
إضافة خط تحت عملية الطرح
========================================
*/

function createLine(width, startColumn) {

    const line =
        document.createElement("div");

    line.className =
        "step-line";

    line.style.width =
        `${width * 48}px`;

    line.style.marginLeft =
        `${startColumn * 48}px`;

    return line;
}


/*
========================================
إظهار سهم إنزال الرقم

السهم يكون مرتبطًا بالرقم الأصلي
في المقسوم.
========================================
*/

function showBringDownArrow(index) {

    const dividend =
        board.querySelector(".dividend");

    if (!dividend) return;

    const originalDigit =
        dividend.querySelector(
            `[data-index="${index}"]`
        );

    if (!originalDigit) return;

    const arrow =
        document.createElement("div");

    arrow.className =
        "bring-arrow";

    arrow.textContent =
        "↓";

    /*
    موضع السهم تحت نفس الرقم
    */

    const left =
        originalDigit.offsetLeft +
        originalDigit.offsetWidth / 2 -
        16;

    const top =
        originalDigit.offsetTop +
        48;

    arrow.style.left =
        `${left}px`;

    arrow.style.top =
        `${top}px`;

    board.appendChild(arrow);

    setTimeout(() => {

        arrow.remove();

    }, 1800);
}


/*
========================================
عرض خطوات العملية التي تم إنجازها
========================================
*/

function renderCompletedWork() {

    /*
    نعيد رسم الرأس
    */

    const result =
        currentProblemData.result;

    renderHeader(
        currentProblem,
        result
    );


    const stepsContainer =
        document.createElement("div");

    stepsContainer.className =
        "steps";

    board.appendChild(
        stepsContainer
    );


    const completed =
        currentStepIndex;


    for (
        let i = 0;
        i < completed;
        i++
    ) {

        const studentStep =
            currentSteps[i];

        const mathStep =
            currentProblemData
                .result.steps[
                    studentStep.divisionStep
                ];


        /*
        لا نكرر نفس المرحلة أكثر من اللازم
        */

        if (
            studentStep.type === "quotient"
        ) {

            /*
            حاصل القسمة موجود في الأعلى.
            */

            continue;
        }


        if (
            studentStep.type === "product"
        ) {

            const current =
                mathStep.current;

            const product =
                mathStep.product;


            /*
            وضع حاصل الضرب تحت العدد الحالي
            */

            const currentText =
                String(current);

            const productText =
                String(product);


            const start =
                Math.max(
                    0,
                    currentProblem.dividend
                        .toString()
                        .length -
                    currentText.length
                );


            const row =
                createStepRow(
                    productText,
                    start
                );

            stepsContainer.appendChild(row);


            const line =
                createLine(
                    productText.length,
                    start
                );

            stepsContainer.appendChild(line);

            continue;
        }


        if (
            studentStep.type === "remainder"
        ) {

            const remainder =
                mathStep.remainder;


            const current =
                mathStep.current;


            const product =
                mathStep.product;


            const text =
                String(remainder);


            const start =
                Math.max(
                    0,
                    currentProblem.dividend
                        .toString()
                        .length -
                    text.length
                );


            const row =
                createStepRow(
                    text,
                    start
                );

            stepsContainer.appendChild(row);


            /*
            إذا كان هناك رقم سيتم إنزاله،
            نضع السهم من الرقم الأصلي.
            */

            if (
                mathStep.broughtDigit !== null
            ) {

                showBringDownArrow(
                    mathStep.index + 1
                );

            }

        }

    }

}


/*
========================================
رسم السؤال الحالي
========================================
*/

let currentProblemData = null;

function renderCurrentQuestion() {

    currentProblemData =
        createStudentSteps(
            currentProblem
        );

    currentSteps =
        currentProblemData.studentSteps;


    currentStepIndex = 0;

    renderCompletedWork();

    updateStepUI();
}


/*
========================================
تحديث واجهة الخطوة
========================================
*/

function updateStepUI() {

    if (
        currentStepIndex >=
        currentSteps.length
    ) {

        finishQuestion();

        return;
    }


    const step =
        currentSteps[
            currentStepIndex
        ];


    stepLabel.textContent =
        `الخطوة ${currentStepIndex + 1} من ${currentSteps.length}`;


    instruction.textContent =
        getInstruction(step);


    answerInput.value = "";

    answerInput.focus();


    message.textContent = "";
    message.className = "message";
}


/*
========================================
النص التعليمي
========================================
*/

function getInstruction(step) {

    const mathStep =
        currentProblemData
            .result
            .steps[
                step.divisionStep
            ];


    if (step.type === "quotient") {

        return (
            `${mathStep.current} ÷ ` +
            `${currentProblem.divisor} = ؟`
        );
    }


    if (step.type === "product") {

        return (
            `${mathStep.quotientDigit} × ` +
            `${currentProblem.divisor} = ؟`
        );
    }


    if (step.type === "remainder") {

        return (
            `${mathStep.current} − ` +
            `${mathStep.product} = ؟`
        );
    }


    return "اكتب الإجابة";
}


/*
========================================
التحقق
========================================
*/

function checkAnswer() {

    const value =
        Number(answerInput.value);

    if (
        answerInput.value.trim() === ""
    ) {

        message.textContent =
            "اكتب الإجابة أولاً.";

        message.className =
            "message error";

        return;
    }


    const correct =
        currentSteps[
            currentStepIndex
        ].value;


    if (value !== correct) {

        message.textContent =
            "❌ حاول مرة أخرى.";

        message.className =
            "message error";

        answerInput.focus();

        return;
    }


    /*
    إجابة صحيحة
    */

    message.textContent =
        "✓ صحيح!";

    message.className =
        "message success";


    currentStepIndex++;


    setTimeout(() => {

        renderCompletedWork();

        updateStepUI();

    }, 600);
}


/*
========================================
انتهاء العملية
========================================
*/

function finishQuestion() {

    score++;


    /*
    إذا انتهت العملية
    */

    message.textContent =
        "🎉 أحسنت! أكملت القسمة.";

    message.className =
        "message success";


    setTimeout(() => {

        if (
            currentQuestion >=
            TOTAL_QUESTIONS
        ) {

            finishLevel();

        } else {

            nextQuestion();

        }

    }, 1100);
}


/*
========================================
عملية جديدة
========================================
*/

function nextQuestion() {

    currentQuestion++;

    questionNumber.textContent =
        currentQuestion;


    /*
    لمنع تكرار العملية
    */

    let attempts = 0;

    do {

        currentProblem =
            generateProblem();

        attempts++;

    } while (
        attempts < 30 &&
        usedProblems.has(
            `${currentProblem.dividend}/${currentProblem.divisor}`
        )
    );


    usedProblems.add(
        `${currentProblem.dividend}/${currentProblem.divisor}`
    );


    renderCurrentQuestion();
}


/*
========================================
العمليات المستخدمة
========================================
*/

const usedProblems =
    new Set();


/*
========================================
إنهاء المستوى
========================================
*/

function finishLevel() {

    const percentage =
        Math.round(
            (score / TOTAL_QUESTIONS) * 100
        );


    finishCard.style.display =
        "flex";


    if (
        score === TOTAL_QUESTIONS
    ) {

        finishTitle.textContent =
            "🏆 ممتاز!";

        finishText.textContent =
            `أجبت عن ${score} من ${TOTAL_QUESTIONS} بشكل صحيح.`;

        /*
        فتح المستوى التالي
        */

        let unlocked =
            Number(
                localStorage.getItem(
                    PROGRESS_KEY
                )
            ) || 1;


        if (
            level < MAX_LEVEL &&
            unlocked <= level
        ) {

            localStorage.setItem(
                PROGRESS_KEY,
                String(level + 1)
            );

        }


        setTimeout(() => {

            if (level < MAX_LEVEL) {

                location.href =
                    `division.html?level=${level + 1}`;

            } else {

                finishCard.style.display =
                    "none";

                location.href =
                    "division-levels.html";

            }

        }, 2500);

    } else {

        finishTitle.textContent =
            "انتهى المستوى";

        finishText.textContent =
            `نتيجتك: ${score}/${TOTAL_QUESTIONS} (${percentage}%).`;

        setTimeout(() => {

            finishCard.style.display =
                "none";

            startGame();

        }, 2500);
    }
}


/*
========================================
بدء اللعبة
========================================
*/

function startGame() {

    currentQuestion = 1;

    score = 0;

    usedProblems.clear();


    questionNumber.textContent =
        currentQuestion;

    levelNumber.textContent =
        level;


    currentProblem =
        generateProblem();


    usedProblems.add(
        `${currentProblem.dividend}/${currentProblem.divisor}`
    );


    renderCurrentQuestion();
}


/*
========================================
زر التحقق
========================================
*/

checkButton.addEventListener(
    "click",
    checkAnswer
);


/*
========================================
Enter للتحقق
========================================
*/

answerInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            checkAnswer();

        }

    }
);


/*
========================================
بدء التطبيق
========================================
*/

startGame();
