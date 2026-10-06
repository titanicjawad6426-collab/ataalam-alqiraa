"use strict";

/*
==================================================
تعلم القسمة
القسمة العمودية بالطريقة المدرسية
==================================================
*/

const TOTAL_QUESTIONS = 12;
const MAX_LEVEL = 10;

const PROGRESS_KEY =
    "divisionUnlockedLevelV1";


/* ================================================
   المستوى
================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );

let level =
    Number(params.get("level")) || 1;

if (level < 1) level = 1;
if (level > MAX_LEVEL) level = MAX_LEVEL;


/*
==================================================
عدد أرقام المقسوم / المقسوم عليه
==================================================
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
==================================================
العناصر
==================================================
*/

const board =
    document.getElementById(
        "divisionBoard"
    );

const levelNumber =
    document.getElementById(
        "levelNumber"
    );

const questionNumber =
    document.getElementById(
        "questionNumber"
    );

const stepLabel =
    document.getElementById(
        "stepLabel"
    );

const instruction =
    document.getElementById(
        "instruction"
    );

const answerInput =
    document.getElementById(
        "answerInput"
    );

const checkButton =
    document.getElementById(
        "checkButton"
    );

const message =
    document.getElementById(
        "message"
    );

const finishCard =
    document.getElementById(
        "finishCard"
    );

const finishTitle =
    document.getElementById(
        "finishTitle"
    );

const finishText =
    document.getElementById(
        "finishText"
    );


/*
==================================================
حالة اللعبة
==================================================
*/

let currentQuestion = 0;

let score = 0;

let currentProblem = null;

let divisionData = null;

let currentStep = 0;

const usedProblems =
    new Set();


/*
==================================================
رقم عشوائي
==================================================
*/

function randomInt(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


/*
==================================================
إنشاء عدد بعدد أرقام معين
==================================================
*/

function randomNumber(digits) {

    const min =
        digits === 1
            ? 1
            : 10 ** (digits - 1);

    const max =
        (10 ** digits) - 1;

    return randomInt(min, max);
}


/*
==================================================
إنشاء عملية
==================================================
*/

function generateProblem() {

    const [
        dividendDigits,
        divisorDigits
    ] = levelDigits[level];


    let dividend;
    let divisor;


    do {

        dividend =
            randomNumber(
                dividendDigits
            );

        divisor =
            randomNumber(
                divisorDigits
            );

    } while (
        divisor <= 0 ||
        divisor >= dividend
    );


    return {

        dividend,
        divisor

    };
}


/*
==================================================
خوارزمية القسمة الطويلة

مثال:

2572 ÷ 3

25 → 8 × 3 = 24 → 1
17 → 5 × 3 = 15 → 2
22 → 7 × 3 = 21 → 1
==================================================
*/

function buildDivision(dividend, divisor) {

    const digits =
        String(dividend)
            .split("")
            .map(Number);


    let current = 0;

    let quotient = "";

    const stages = [];


    for (
        let i = 0;
        i < digits.length;
        i++
    ) {

        current =
            current * 10 +
            digits[i];


        /*
        قبل بداية حاصل القسمة
        */

        if (
            current < divisor &&
            quotient === ""
        ) {

            continue;
        }


        /*
        صفر داخل حاصل القسمة
        */

        if (
            current < divisor
        ) {

            quotient += "0";

            continue;
        }


        const quotientDigit =
            Math.floor(
                current / divisor
            );


        const product =
            quotientDigit *
            divisor;


        const remainder =
            current -
            product;


        quotient +=
            String(quotientDigit);


        stages.push({

            sourceIndex: i,

            current,

            quotientDigit,

            product,

            remainder,

            nextDigit:
                i + 1 <
                digits.length
                    ? digits[i + 1]
                    : null

        });


        current =
            remainder;
    }


    return {

        quotient,

        remainder: current,

        stages

    };
}


/*
==================================================
إنشاء الخطوات التي يجب أن يحلها الطفل
==================================================
*/

function buildStudentSteps(data) {

    const steps = [];


    data.stages.forEach(
        (stage, stageIndex) => {


            /*
            1 — رقم حاصل القسمة
            */

            steps.push({

                type: "quotient",

                stageIndex,

                answer:
                    stage.quotientDigit,

                text:
                    `${stage.current} ÷ ` +
                    `${currentProblem.divisor} = ؟`

            });


            /*
            2 — حاصل الضرب
            */

            steps.push({

                type: "product",

                stageIndex,

                answer:
                    stage.product,

                text:
                    `${stage.quotientDigit} × ` +
                    `${currentProblem.divisor} = ؟`

            });


            /*
            3 — نتيجة الطرح
            */

            steps.push({

                type: "remainder",

                stageIndex,

                answer:
                    stage.remainder,

                text:
                    `${stage.current} − ` +
                    `${stage.product} = ؟`

            });

        }
    );


    return steps;
}


/*
==================================================
إنشاء خلية
==================================================
*/

function makeCell(text = "") {

    const cell =
        document.createElement("div");

    cell.className =
        "work-cell";

    cell.textContent =
        text;

    return cell;
}


/*
==================================================
رسم رأس القسمة

2572 | 3
     |---
       857
==================================================
*/

function renderHeader() {

    const dividend =
        String(
            currentProblem.dividend
        );


    const dividendLength =
        dividend.length;


    const cellSize =
        parseInt(
            getComputedStyle(board)
                .getPropertyValue(
                    "--cell"
                )
        );


    const dividerX =
        dividendLength *
        cellSize;


    /*
    الرأس
    */

    const head =
        document.createElement("div");

    head.className =
        "division-head";


    /*
    المقسوم
    */

    const dividendBox =
        document.createElement("div");

    dividendBox.className =
        "dividend";


    [...dividend].forEach(
        (digit, index) => {

            const d =
                document.createElement(
                    "div"
                );

            d.className =
                "dividend-digit";

            d.textContent =
                digit;

            d.dataset.index =
                index;

            dividendBox.appendChild(d);

        }
    );


    head.appendChild(
        dividendBox
    );


    /*
    الخط العمودي
    */

    const vertical =
        document.createElement("div");

    vertical.className =
        "vertical-line";

    vertical.style.left =
        `${dividerX}px`;

    head.appendChild(
        vertical
    );


    /*
    المقسوم عليه
    */

    const divisor =
        document.createElement("div");

    divisor.className =
        "divisor";

    divisor.textContent =
        currentProblem.divisor;

    divisor.style.left =
        `${dividerX + 12}px`;

    head.appendChild(
        divisor
    );


    /*
    الخط الأفقي
    */

    const horizontal =
        document.createElement("div");

    horizontal.className =
        "horizontal-line";

    horizontal.style.left =
        `${dividerX}px`;

    horizontal.style.top =
        `52px`;

    horizontal.style.width =
        `${Math.max(
            80,
            String(currentProblem.divisor).length *
            cellSize +
            55
        )}px`;

    head.appendChild(
        horizontal
    );


    /*
    حاصل القسمة
    */

    const quotient =
        document.createElement("div");

    quotient.className =
        "quotient";

    quotient.style.left =
        `${dividerX + 12}px`;


    const quotientLength =
        divisionData.quotient.length;


    for (
        let i = 0;
        i < quotientLength;
        i++
    ) {

        const q =
            document.createElement(
                "div"
            );

        q.className =
            "quotient-digit";

        q.dataset.position =
            i;

        /*
        لا نظهر النتيجة كاملة.
        تظهر الأرقام تدريجيًا.
        */

        q.textContent = "";


        quotient.appendChild(q);

    }


    head.appendChild(
        quotient
    );


    board.appendChild(
        head
    );
}


/*
==================================================
وضع رقم في حاصل القسمة
==================================================
*/

function putQuotientDigit(
    stageIndex,
    digit
) {

    const quotientDigits =
        board.querySelectorAll(
            ".quotient-digit"
        );


    if (
        quotientDigits[stageIndex]
    ) {

        quotientDigits[
            stageIndex
        ].textContent =
            digit;

    }
}


/*
==================================================
حساب موضع بداية الرقم
==================================================
*/

function getRightAlignedStart(
    text
) {

    const dividendLength =
        String(
            currentProblem.dividend
        ).length;


    return (
        dividendLength -
        String(text).length
    );
}


/*
==================================================
رسم صف
==================================================
*/

function renderRow(
    container,
    text,
    start
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "work-row";


    const total =
        String(
            currentProblem.dividend
        ).length;


    for (
        let i = 0;
        i < total;
        i++
    ) {

        row.appendChild(
            makeCell()
        );

    }


    [...String(text)].forEach(
        (char, index) => {

            const pos =
                start + index;


            if (
                row.children[pos]
            ) {

                row.children[pos]
                    .textContent =
                    char;

            }

        }
    );


    container.appendChild(
        row
    );


    return row;
}


/*
==================================================
خط الطرح
==================================================
*/

function renderLine(
    container,
    length,
    start
) {

    const line =
        document.createElement(
            "div"
        );

    line.className =
        "work-line";


    const cellSize =
        parseInt(
            getComputedStyle(board)
                .getPropertyValue(
                    "--cell"
                )
        );


    line.style.width =
        `${length * cellSize}px`;


    line.style.marginLeft =
        `${start * cellSize}px`;


    container.appendChild(
        line
    );
}


/*
==================================================
السهم من الرقم الأصلي
==================================================
*/

function renderArrow(
    container,
    sourceIndex
) {

    const cellSize =
        parseInt(
            getComputedStyle(board)
                .getPropertyValue(
                    "--cell"
                )
        );


    const arrow =
        document.createElement(
            "div"
        );

    arrow.className =
        "bring-arrow";


    arrow.textContent =
        "↓";


    arrow.style.left =
        `${sourceIndex * cellSize}px`;


    /*
    يوضع السهم تحت المقسوم
    */

    arrow.style.top =
        `42px`;


    container.appendChild(
        arrow
    );
}


/*
==================================================
رسم العمل الذي تم إنجازه
==================================================
*/

function renderWork() {

    /*
    نحافظ على الرأس
    */

    board.innerHTML = "";

    renderHeader();


    const work =
        document.createElement(
            "div"
        );

    work.className =
        "work-area";


    board.appendChild(
        work
    );


    /*
    نرسم المراحل التي أجاب عنها الطفل
    */

    let lastStage =
        -1;


    for (
        let i = 0;
        i < currentStep;
        i++
    ) {

        const studentStep =
            studentSteps[i];


        const stage =
            divisionData.stages[
                studentStep.stageIndex
            ];


        /*
        إذا بدأنا مرحلة جديدة
        */

        if (
            studentStep.stageIndex !==
            lastStage
        ) {

            lastStage =
                studentStep.stageIndex;

        }


        /*
        رقم حاصل القسمة
        */

        if (
            studentStep.type ===
            "quotient"
        ) {

            putQuotientDigit(
                studentStep.stageIndex,
                studentStep.answer
            );

        }


        /*
        بعد إدخال حاصل الضرب
        */

        if (
            studentStep.type ===
            "product"
        ) {

            /*
            العدد الذي تتم عليه القسمة
            */

            const currentText =
                String(
                    stage.current
                );


            const start =
                getRightAlignedStart(
                    currentText
                );


            renderRow(
                work,
                currentText,
                start
            );


            /*
            علامة الطرح
            */

            const minus =
                document.createElement(
                    "div"
                );

            minus.className =
                "minus";

            minus.textContent =
                "−";

            minus.style.left =
                `${start * 48 - 27}px`;


            work.appendChild(
                minus
            );


            /*
            حاصل الضرب
            */

            const productText =
                String(
                    stage.product
                );


            const productStart =
                getRightAlignedStart(
                    productText
                );


            renderRow(
                work,
                productText,
                productStart
            );


            renderLine(
                work,
                productText.length,
                productStart
            );

        }


        /*
        بعد نتيجة الطرح
        */

        if (
            studentStep.type ===
            "remainder"
        ) {

            const remainderText =
                String(
                    stage.remainder
                );


            const remainderStart =
                getRightAlignedStart(
                    remainderText
                );


            renderRow(
                work,
                remainderText,
                remainderStart
            );


            /*
            إذا بقي رقم في المقسوم
            يتم إنزاله بسهم
            */

            if (
                stage.nextDigit !== null
            ) {

                renderArrow(
                    work,
                    stage.sourceIndex + 1
                );


                /*
                إظهار العدد الجديد
                */

                const nextCurrent =
                    stage.remainder * 10 +
                    stage.nextDigit;


                const nextText =
                    String(
                        nextCurrent
                    );


                const nextStart =
                    getRightAlignedStart(
                        nextText
                    );


                renderRow(
                    work,
                    nextText,
                    nextStart
                );

            }

        }

    }
}


/*
==================================================
تحديث سؤال الطفل
==================================================
*/

function updateUI() {

    if (
        currentStep >=
        studentSteps.length
    ) {

        completeQuestion();

        return;
    }


    const step =
        studentSteps[
            currentStep
        ];


    stepLabel.textContent =
        `الخطوة ${currentStep + 1} من ${studentSteps.length}`;


    instruction.textContent =
        step.text;


    answerInput.value = "";

    answerInput.focus();


    message.textContent = "";

    message.className =
        "message";
}


/*
==================================================
التحقق من الإجابة
==================================================
*/

function checkAnswer() {

    const input =
        answerInput.value.trim();


    if (input === "") {

        message.textContent =
            "اكتب الإجابة أولاً.";

        message.className =
            "message error";

        answerInput.focus();

        return;
    }


    const value =
        Number(input);


    const correct =
        studentSteps[
            currentStep
        ].answer;


    if (
        value !== correct
    ) {

        message.textContent =
            "❌ إجابة غير صحيحة، حاول مرة أخرى.";

        message.className =
            "message error";

        answerInput.focus();

        return;
    }


    /*
    صحيح
    */

    message.textContent =
        "✓ صحيح!";

    message.className =
        "message success";


    currentStep++;


    /*
    إظهار التغيير
    */

    setTimeout(() => {

        renderWork();

        updateUI();

    }, 500);
}


/*
==================================================
إنهاء العملية
==================================================
*/

function completeQuestion() {

    score++;


    message.textContent =
        "🎉 أحسنت! أكملت العملية.";

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

    }, 1000);
}


/*
==================================================
عملية جديدة
==================================================
*/

function nextQuestion() {

    currentQuestion++;


    questionNumber.textContent =
        currentQuestion;


    let attempts = 0;


    do {

        currentProblem =
            generateProblem();

        attempts++;

    } while (
        usedProblems.has(
            `${currentProblem.dividend}/${currentProblem.divisor}`
        ) &&
        attempts < 100
    );


    usedProblems.add(
        `${currentProblem.dividend}/${currentProblem.divisor}`
    );


    startProblem();
}


/*
==================================================
بدء العملية
==================================================
*/

function startProblem() {

    divisionData =
        buildDivision(
            currentProblem.dividend,
            currentProblem.divisor
        );


    /*
    الخطوات التي سيجيب عنها الطفل
    */

    studentSteps =
        buildStudentSteps(
            divisionData
        );


    currentStep = 0;


    renderWork();

    updateUI();
}


/*
==================================================
إنهاء المستوى
==================================================
*/

function finishLevel() {

    finishCard.style.display =
        "flex";


    if (
        score === TOTAL_QUESTIONS
    ) {

        finishTitle.textContent =
            "🏆 ممتاز!";


        finishText.textContent =
            `أجبت عن ${score} من ${TOTAL_QUESTIONS} بشكل صحيح. ` +
            `تم فتح المستوى التالي.`;


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

            if (
                level < MAX_LEVEL
            ) {

                location.href =
                    `division.html?level=${level + 1}`;

            } else {

                location.href =
                    "division-levels.html";

            }

        }, 2500);


    } else {

        finishTitle.textContent =
            "انتهى المستوى";


        finishText.textContent =
            `نتيجتك ${score}/${TOTAL_QUESTIONS}. ` +
            `حاول مرة أخرى لإتقان المستوى.`;


        setTimeout(() => {

            finishCard.style.display =
                "none";


            score = 0;

            currentQuestion = 1;

            usedProblems.clear();


            questionNumber.textContent =
                currentQuestion;


            currentProblem =
                generateProblem();


            usedProblems.add(
                `${currentProblem.dividend}/${currentProblem.divisor}`
            );


            startProblem();

        }, 2500);

    }
}


/*
==================================================
متغير الخطوات
==================================================
*/

let studentSteps = [];


/*
==================================================
زر التحقق
==================================================
*/

checkButton.addEventListener(
    "click",
    checkAnswer
);


/*
==================================================
Enter
==================================================
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
==================================================
بدء اللعبة
==================================================
*/

levelNumber.textContent =
    level;

currentQuestion = 1;

questionNumber.textContent =
    currentQuestion;


currentProblem =
    generateProblem();


usedProblems.add(
    `${currentProblem.dividend}/${currentProblem.divisor}`
);


startProblem();
