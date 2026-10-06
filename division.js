"use strict";


/* =================================================
   الإعدادات
================================================= */

const TOTAL_QUESTIONS = 12;

const MAX_LEVEL = 10;

const PROGRESS_KEY =
    "divisionUnlockedLevelV1";


/* =================================================
   المستوى
================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

let level =
    Number(
        params.get("level")
    ) || 1;


if (level < 1)
    level = 1;

if (level > MAX_LEVEL)
    level = MAX_LEVEL;


/* =================================================
   مستويات القسمة
================================================= */

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


/* =================================================
   العناصر
================================================= */

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

const stepTitle =
    document.getElementById(
        "stepTitle"
    );

const stepHelp =
    document.getElementById(
        "stepHelp"
    );

const message =
    document.getElementById(
        "message"
    );

const checkButton =
    document.getElementById(
        "checkButton"
    );

const finish =
    document.getElementById(
        "finish"
    );

const finishTitle =
    document.getElementById(
        "finishTitle"
    );

const finishText =
    document.getElementById(
        "finishText"
    );


/* =================================================
   حالة اللعبة
================================================= */

let currentQuestion = 1;

let score = 0;

let currentProblem = null;

let division = null;

let steps = [];

let currentStep = 0;

let usedProblems =
    new Set();


/* =================================================
   أرقام عشوائية
================================================= */

function randomInt(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


function randomNumber(digits) {

    const min =
        digits === 1
            ? 1
            : 10 ** (digits - 1);

    const max =
        (10 ** digits) - 1;

    return randomInt(
        min,
        max
    );
}


/* =================================================
   إنشاء عملية
================================================= */

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
        divisor >= dividend ||
        divisor === 0
    );


    return {
        dividend,
        divisor
    };
}


/* =================================================
   حساب القسمة الطويلة
================================================= */

function buildDivision(
    dividend,
    divisor
) {

    const digits =
        String(dividend)
            .split("")
            .map(Number);


    let current = 0;

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
        إذا كان العدد أصغر من المقسوم عليه
        ننتظر الرقم التالي.
        */

        if (
            current < divisor &&
            stages.length === 0
        ) {

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


        stages.push({

            sourceIndex: i,

            current,

            quotientDigit,

            product,

            remainder,

            nextDigit:
                i + 1 < digits.length
                    ? digits[i + 1]
                    : null

        });


        current =
            remainder;
    }


    return {

        stages

    };
}


/* =================================================
   إنشاء خطوات الطفل
================================================= */

function buildSteps() {

    const result = [];


    division.stages.forEach(
        (stage, index) => {

            /*
            الخطوة 1:
            رقم حاصل القسمة
            */

            result.push({

                type: "quotient",

                stageIndex: index,

                answer:
                    String(
                        stage.quotientDigit
                    ),

                text:
                    `${stage.current} ÷ ` +
                    `${currentProblem.divisor}`

            });


            /*
            الخطوة 2:
            حاصل الضرب
            */

            result.push({

                type: "product",

                stageIndex: index,

                answer:
                    String(
                        stage.product
                    ),

                text:
                    `${stage.quotientDigit} × ` +
                    `${currentProblem.divisor}`

            });


            /*
            الخطوة 3:
            الباقي
            */

            result.push({

                type: "remainder",

                stageIndex: index,

                answer:
                    String(
                        stage.remainder
                    ),

                text:
                    `${stage.current} − ` +
                    `${stage.product}`

            });

        }
    );


    return result;
}


/* =================================================
   عدد الخانات
================================================= */

function boardCells() {

    return String(
        currentProblem.dividend
    ).length;
}


/* =================================================
   إنشاء صف شبكي
================================================= */

function createGridRow(
    className
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        className;

    row.style.gridTemplateColumns =
        `repeat(${boardCells()}, var(--cell))`;

    return row;
}


/* =================================================
   خانة فارغة
================================================= */

function emptyCell() {

    const cell =
        document.createElement(
            "div"
        );

    cell.className =
        "work-cell";

    return cell;
}


/* =================================================
   رسم المقسوم والمقسوم عليه
================================================= */

function renderHeader() {

    const dividend =
        String(
            currentProblem.dividend
        );


    const cells =
        boardCells();


    /*
    المقسوم
    */

    const dividendRow =
        createGridRow(
            "dividend-row"
        );


    for (
        let i = 0;
        i < cells;
        i++
    ) {

        const cell =
            document.createElement(
                "div"
            );

        cell.className =
            "dividend-digit";

        cell.textContent =
            dividend[i];

        dividendRow.appendChild(
            cell
        );
    }


    board.appendChild(
        dividendRow
    );


    /*
    حجم الخلية
    */

    const cellSize =
        parseFloat(
            getComputedStyle(board)
                .getPropertyValue(
                    "--cell"
                )
        );


    const dividerX =
        cells * cellSize;


    /*
    الخط العمودي
    */

    const vertical =
        document.createElement(
            "div"
        );

    vertical.className =
        "vertical-line";

    vertical.style.left =
        `${dividerX}px`;

    board.appendChild(
        vertical
    );


    /*
    المقسوم عليه
    */

    const divisor =
        document.createElement(
            "div"
        );

    divisor.className =
        "divisor";

    divisor.textContent =
        currentProblem.divisor;

    divisor.style.left =
        `${dividerX + 8}px`;

    divisor.style.top =
        "3px";

    divisor.style.width =
        "55px";

    board.appendChild(
        divisor
    );


    /*
    الخط الأفقي
    */

    const horizontal =
        document.createElement(
            "div"
        );

    horizontal.className =
        "horizontal-line";

    horizontal.style.left =
        `${dividerX}px`;

    horizontal.style.top =
        "53px";

    horizontal.style.width =
        "90px";

    board.appendChild(
        horizontal
    );


    /*
    حاصل القسمة
    */

    renderQuotient();
}


/* =================================================
   رسم حاصل القسمة
================================================= */

function renderQuotient() {

    const cells =
        boardCells();

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "quotient-row";

    row.style.left =
        "0";

    row.style.top =
        "0";

    row.style.gridTemplateColumns =
        `repeat(${cells}, var(--cell))`;


    division.stages.forEach(
        (stage, index) => {

            /*
            موقع الرقم في حاصل القسمة
            */

            const cell =
                document.createElement(
                    "div"
                );

            cell.className =
                "quotient-cell";

            cell.style.gridColumn =
                String(
                    stage.sourceIndex + 1
                );


            /*
            هل هذه الخطوة تم إنجازها؟
            */

            const stepIndex =
                index * 3;


            if (
                currentStep >
                stepIndex
            ) {

                cell.textContent =
                    stage.quotientDigit;

            } else if (
                currentStep ===
                stepIndex
            ) {

                const input =
                    createDigitGroup(
                        String(
                            stage.quotientDigit
                        ),
                        stepIndex
                    );

                cell.appendChild(
                    input
                );

            } else {

                cell.innerHTML =
                    '<span class="empty-dot">•</span>';

            }


            row.appendChild(
                cell
            );

        }
    );


    board.appendChild(
        row
    );
}


/* =================================================
   إنشاء مجموعة خانات للأرقام
================================================= */

function createDigitGroup(
    answer,
    stepIndex
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.style.display =
        "flex";

    wrapper.style.direction =
        "ltr";


    const digits =
        String(answer)
            .split("");


    /*
    الخانات من اليسار إلى اليمين
    ولكن الإدخال يبدأ من اليمين.
    */

    digits.forEach(
        (digit, index) => {

            const input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            input.inputMode =
                "numeric";

            input.maxLength =
                1;

            input.className =
                "digit-input";

            input.dataset.answer =
                digit;

            input.dataset.step =
                stepIndex;

            input.dataset.index =
                index;

            input.dataset.total =
                digits.length;


            /*
            قبل التحقق يمكن تعديل الرقم
            */

            input.addEventListener(
                "input",
                () => {

                    input.value =
                        input.value.replace(
                            /[^0-9]/g,
                            ""
                        );


                    if (
                        input.value !== ""
                    ) {

                        moveToPreviousDigit(
                            wrapper,
                            index
                        );

                    }

                }
            );


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Backspace" &&
                        input.value === ""
                    ) {

                        moveToNextDigit(
                            wrapper,
                            index
                        );

                    }

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        checkCurrentStep();

                    }

                }
            );


            wrapper.appendChild(
                input
            );

        }
    );


    /*
    البداية من الرقم الأخير
    */

    setTimeout(() => {

        const inputs =
            wrapper.querySelectorAll(
                "input"
            );

        if (
            inputs.length
        ) {

            inputs[
                inputs.length - 1
            ].focus();

        }

    }, 50);


    return wrapper;
}


/* =================================================
   الانتقال للخانة اليسرى
================================================= */

function moveToPreviousDigit(
    wrapper,
    index
) {

    const inputs =
        wrapper.querySelectorAll(
            "input"
        );


    const previous =
        index - 1;


    if (
        previous >= 0
    ) {

        inputs[
            previous
        ].focus();

    }
}


/* =================================================
   الرجوع للخانة اليمنى
================================================= */

function moveToNextDigit(
    wrapper,
    index
) {

    const inputs =
        wrapper.querySelectorAll(
            "input"
        );


    const next =
        index + 1;


    if (
        next < inputs.length
    ) {

        inputs[
            next
        ].focus();

    }
}


/* =================================================
   الحصول على قيمة مجموعة الخانات
================================================= */

function getGroupValue(
    wrapper
) {

    const inputs =
        wrapper.querySelectorAll(
            "input"
        );


    let value = "";


    inputs.forEach(
        input => {

            value +=
                input.value || "";

        }
    );


    return value;
}


/* =================================================
   هل جميع الخانات مملوءة؟
================================================= */

function groupComplete(
    wrapper
) {

    const inputs =
        wrapper.querySelectorAll(
            "input"
        );


    return [
        ...inputs
    ].every(
        input =>
            input.value !== ""
    );
}


/* =================================================
   رسم خطوات القسمة
================================================= */

function renderWork() {

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
    رسم المراحل السابقة
    */

    for (
        let i = 0;
        i < division.stages.length;
        i++
    ) {

        const stage =
            division.stages[i];


        const qStep =
            i * 3;

        const pStep =
            i * 3 + 1;

        const rStep =
            i * 3 + 2;


        /*
        العدد الذي نقسمه
        */

        const currentRow =
            createNumberRow(
                work,
                stage.current,
                stage.sourceIndex
            );


        /*
        حاصل الضرب
        */

        if (
            currentStep > pStep
        ) {

            const productRow =
                createNumberRow(
                    work,
                    stage.product,
                    stage.sourceIndex
                );


            addMinus(
                productRow,
                stage.sourceIndex
            );


            addLine(
                work,
                String(
                    stage.product
                ).length,
                stage.sourceIndex
            );

        } else if (
            currentStep === pStep
        ) {

            const productRow =
                createAnswerRow(
                    work,
                    String(
                        stage.product
                    ),
                    stage.sourceIndex,
                    pStep
                );


            addMinus(
                productRow,
                stage.sourceIndex
            );


            addLine(
                work,
                String(
                    stage.product
                ).length,
                stage.sourceIndex
            );

        }


        /*
        الباقي
        */

        if (
            currentStep > rStep
        ) {

            createNumberRow(
                work,
                stage.remainder,
                stage.sourceIndex
            );

        } else if (
            currentStep === rStep
        ) {

            createAnswerRow(
                work,
                String(
                    stage.remainder
                ),
                stage.sourceIndex,
                rStep
            );

        }


        /*
        السهم والرقم المنزّل
        */

        if (
            currentStep > rStep &&
            stage.nextDigit !== null
        ) {

            addArrow(
                work,
                stage.sourceIndex + 1
            );


            const nextNumber =
                stage.remainder * 10 +
                stage.nextDigit;


            createNumberRow(
                work,
                nextNumber,
                stage.sourceIndex + 1
            );

        }

    }
}


/* =================================================
   إنشاء صف رقم
================================================= */

function createNumberRow(
    container,
    number,
    endIndex
) {

    const row =
        createGridRow(
            "work-row"
        );


    const text =
        String(number);


    const start =
        endIndex -
        text.length +
        1;


    for (
        let i = 0;
        i < boardCells();
        i++
    ) {

        const cell =
            emptyCell();


        const position =
            i - start;


        if (
            position >= 0 &&
            position < text.length
        ) {

            cell.textContent =
                text[position];

        }


        row.appendChild(
            cell
        );

    }


    container.appendChild(
        row
    );


    return row;
}


/* =================================================
   إنشاء صف إجابة داخل العملية
================================================= */

function createAnswerRow(
    container,
    answer,
    endIndex,
    stepIndex
) {

    const row =
        createGridRow(
            "work-row"
        );


    const text =
        String(answer);


    const start =
        endIndex -
        text.length +
        1;


    for (
        let i = 0;
        i < boardCells();
        i++
    ) {

        const cell =
            emptyCell();


        const position =
            i - start;


        if (
            position >= 0 &&
            position < text.length
        ) {

            /*
            نضع مجموعة الخانات
            في أول خلية فقط
            */

            if (
                position === 0
            ) {

                const group =
                    createDigitGroup(
                        text,
                        stepIndex
                    );


                cell.appendChild(
                    group
                );

            }

        }


        row.appendChild(
            cell
        );

    }


    container.appendChild(
        row
    );


    return row;
}


/* =================================================
   علامة الطرح
================================================= */

function addMinus(
    row,
    startIndex
) {

    const minus =
        document.createElement(
            "span"
        );

    minus.className =
        "minus-sign";

    minus.textContent =
        "−";


    row.children[
        Math.max(
            0,
            startIndex -
            String(
                currentProblem.divisor
            ).length
        )
    ].appendChild(
        minus
    );
}


/* =================================================
   خط الطرح
================================================= */

function addLine(
    container,
    length,
    startIndex
) {

    const line =
        document.createElement(
            "div"
        );

    line.className =
        "subtraction-line";


    const cellSize =
        parseFloat(
            getComputedStyle(board)
                .getPropertyValue(
                    "--cell"
                )
        );


    line.style.width =
        `${length * cellSize}px`;


    line.style.marginLeft =
        `${(
            startIndex -
            length +
            1
        ) * cellSize}px`;


    container.appendChild(
        line
    );
}


/* =================================================
   سهم إنزال الرقم
================================================= */

function addArrow(
    container,
    index
) {

    const arrow =
        document.createElement(
            "div"
        );

    arrow.className =
        "down-arrow";

    arrow.textContent =
        "↓";


    const cellSize =
        parseFloat(
            getComputedStyle(board)
                .getPropertyValue(
                    "--cell"
                )
        );


    arrow.style.left =
        `${index * cellSize}px`;


    /*
    السهم يظهر تحت الرقم الأصلي
    */

    arrow.style.top =
        "43px";


    container.appendChild(
        arrow
    );
}


/* =================================================
   الخطوة الحالية
================================================= */

function updateStepInfo() {

    if (
        currentStep >=
        steps.length
    ) {

        return;
    }


    const step =
        steps[currentStep];


    if (
        step.type ===
        "quotient"
    ) {

        stepTitle.textContent =
            "اكتب رقم حاصل القسمة";

        stepHelp.textContent =
            `${step.text} = ؟`;

    }


    if (
        step.type ===
        "product"
    ) {

        stepTitle.textContent =
            "اكتب حاصل الضرب";

        stepHelp.textContent =
            `${step.text} = ؟`;

    }


    if (
        step.type ===
        "remainder"
    ) {

        stepTitle.textContent =
            "اكتب الباقي";

        stepHelp.textContent =
            `${step.text} = ؟`;

    }


    message.textContent =
        "";

    message.className =
        "message";
}


/* =================================================
   التحقق من الخطوة الحالية
================================================= */

function checkCurrentStep() {

    if (
        currentStep >=
        steps.length
    ) {

        return;
    }


    /*
    نبحث عن مجموعة الخانات
    الخاصة بالخطوة الحالية
    */

    const groups =
        board.querySelectorAll(
            ".digit-input"
        );


    const currentInputs =
        [
            ...groups
        ].filter(
            input =>
                Number(
                    input.dataset.step
                ) === currentStep
        );


    if (
        currentInputs.length === 0
    ) {

        return;
    }


    /*
    نجمع الرقم
    */

    const value =
        currentInputs
            .map(
                input =>
                    input.value || ""
            )
            .join("");


    /*
    يجب أن تكون كل الخانات مملوءة
    */

    if (
        value.length !==
        steps[currentStep]
            .answer.length
    ) {

        message.textContent =
            "أكمل كتابة الرقم.";

        message.className =
            "message error";

        return;
    }


    const correct =
        steps[currentStep]
            .answer;


    if (
        value !== correct
    ) {

        message.textContent =
            "❌ حاول مرة أخرى.";

        message.className =
            "message error";


        /*
        تحديد أول خانة
        تحتاج إلى تصحيح
        */

        const inputs =
            currentInputs;


        for (
            let i = 0;
            i < inputs.length;
            i++
        ) {

            if (
                inputs[i].value !==
                correct[i]
            ) {

                inputs[i].focus();

                break;

            }

        }

        return;
    }


    /*
    صحيح
    */

    currentInputs.forEach(
        input => {

            input.classList.add(
                "locked"
            );

            input.readOnly =
                true;

        }
    );


    message.textContent =
        "✓ صحيح!";

    message.className =
        "message success";


    currentStep++;


    setTimeout(
        () => {

            if (
                currentStep >=
                steps.length
            ) {

                completeQuestion();

            } else {

                renderWork();

                updateStepInfo();

            }

        },
        500
    );
}


/* =================================================
   إنهاء العملية
================================================= */

function completeQuestion() {

    message.textContent =
        "🎉 أحسنت! أكملت العملية.";

    message.className =
        "message success";


    score++;


    setTimeout(
        () => {

            if (
                currentQuestion >=
                TOTAL_QUESTIONS
            ) {

                finishLevel();

            } else {

                nextQuestion();

            }

        },
        900
    );
}


/* =================================================
   عملية جديدة
================================================= */

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


/* =================================================
   بدء العملية
================================================= */

function startProblem() {

    division =
        buildDivision(
            currentProblem.dividend,
            currentProblem.divisor
        );


    steps =
        buildSteps();


    currentStep = 0;


    renderWork();

    updateStepInfo();
}


/* =================================================
   نهاية المستوى
================================================= */

function finishLevel() {

    finish.style.display =
        "flex";


    if (
        score === TOTAL_QUESTIONS
    ) {

        finishTitle.textContent =
            "🏆 ممتاز!";


        finishText.textContent =
            `أجبت عن ${score} من ${TOTAL_QUESTIONS} بشكل صحيح.`;


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


        setTimeout(
            () => {

                if (
                    level < MAX_LEVEL
                ) {

                    location.href =
                        `division.html?level=${level + 1}`;

                } else {

                    location.href =
                        "division-levels.html";

                }

            },
            2500
        );

    } else {

        finishTitle.textContent =
            "انتهى المستوى";


        finishText.textContent =
            `نتيجتك ${score}/${TOTAL_QUESTIONS}. حاول مرة أخرى.`;


        setTimeout(
            () => {

                location.reload();

            },
            2500
        );

    }
}


/* =================================================
   زر التحقق
================================================= */

checkButton.addEventListener(
    "click",
    checkCurrentStep
);


/* =================================================
   البداية
================================================= */

levelNumber.textContent =
    level;

questionNumber.textContent =
    currentQuestion;


currentProblem =
    generateProblem();


usedProblems.add(
    `${currentProblem.dividend}/${currentProblem.divisor}`
);


startProblem();
