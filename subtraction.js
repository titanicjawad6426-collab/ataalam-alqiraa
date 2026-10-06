"use strict";


/* =========================================
   إعدادات اللعبة
========================================= */

const TOTAL_QUESTIONS = 12;

const MAX_LEVEL = 10;

const PROGRESS_KEY =
    "subtractionUnlockedLevelV1";


/* =========================================
   مستويات الطرح
========================================= */

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


/* =========================================
   عناصر الصفحة
========================================= */

const operationBoard =
    document.getElementById(
        "operationBoard"
    );

const numberARow =
    document.getElementById(
        "numberARow"
    );

const numberBRow =
    document.getElementById(
        "numberBRow"
    );

const separator =
    document.getElementById(
        "separator"
    );

const answerRow =
    document.getElementById(
        "answerRow"
    );

const levelNumber =
    document.getElementById(
        "levelNumber"
    );

const questionNumber =
    document.getElementById(
        "questionNumber"
    );

const checkAnswerButton =
    document.getElementById(
        "checkAnswer"
    );

const message =
    document.getElementById(
        "message"
    );


/* =========================================
   قراءة المستوى
========================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const requestedLevel =
    parseInt(
        params.get("level") || "1",
        10
    );


let unlockedLevel =
    parseInt(
        localStorage.getItem(
            PROGRESS_KEY
        ) || "1",
        10
    );


if (
    unlockedLevel < 1
) {

    unlockedLevel = 1;

}


if (
    unlockedLevel > MAX_LEVEL
) {

    unlockedLevel =
        MAX_LEVEL;

}


let currentLevel =
    Math.max(
        1,
        Math.min(
            requestedLevel,
            MAX_LEVEL
        )
    );


/*
   منع الدخول إلى مستوى مقفل
*/

if (
    currentLevel >
    unlockedLevel
) {

    currentLevel =
        unlockedLevel;

}


/* =========================================
   حالة اللعبة
========================================= */

let questions = [];

let currentQuestionIndex = 0;

let score = 0;

let currentQuestion = null;

let answerValues = [];

let currentSlot = -1;

let answerChecked = false;


/* =========================================
   إنشاء رقم عشوائي
========================================= */

function randomNumber(
    digits
) {

    if (
        digits === 1
    ) {

        return (
            Math.floor(
                Math.random() * 9
            ) + 1
        );

    }


    const min =
        Math.pow(
            10,
            digits - 1
        );


    const max =
        Math.pow(
            10,
            digits
        ) - 1;


    return (
        Math.floor(
            Math.random() *
            (max - min + 1)
        ) + min
    );

}


/* =========================================
   إنشاء عمليات الطرح
========================================= */

function generateQuestions() {

    const [
        digitsA,
        digitsB
    ] =
        levelDigits[
            currentLevel
        ];


    const result = [];

    const used =
        new Set();


    while (
        result.length <
        TOTAL_QUESTIONS
    ) {

        const a =
            randomNumber(
                digitsA
            );


        const b =
            randomNumber(
                digitsB
            );


        /*
           يجب أن يكون العدد الأول
           أكبر من العدد الثاني
        */

        if (
            a <= b
        ) {

            continue;

        }


        const key =
            `${a}-${b}`;


        /*
           منع تكرار العملية
        */

        if (
            used.has(key)
        ) {

            continue;

        }


        used.add(key);


        result.push({

            a: a,

            b: b,

            answer:
                a - b

        });

    }


    return result;

}


/* =========================================
   إنشاء رقم
========================================= */

function createDigit(
    digit,
    column
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "digit";


    element.textContent =
        digit;


    element.style.gridColumn =
        String(
            column
        );


    return element;

}


/* =========================================
   رسم العدد الأول
========================================= */

function renderNumberA() {

    numberARow.innerHTML =
        "";


    const value =
        String(
            currentQuestion.a
        );


    const length =
        value.length;


    const startColumn =
        6 - length + 1;


    for (
        let i = 0;
        i < length;
        i++
    ) {

        const digit =
            createDigit(
                value[i],
                startColumn + i
            );


        numberARow.appendChild(
            digit
        );

    }

}


/* =========================================
   رسم العدد الثاني
========================================= */

function renderNumberB() {

    numberBRow.innerHTML =
        "";


    const value =
        String(
            currentQuestion.b
        );


    const length =
        value.length;


    const startColumn =
        6 - length + 1;


    /*
       علامة الطرح
       مباشرة إلى يسار العدد
    */

    const symbolColumn =
        startColumn - 1;


    const symbol =
        document.createElement(
            "div"
        );


    symbol.className =
        "subtract-symbol";


    symbol.textContent =
        "−";


    symbol.style.gridColumn =
        String(
            symbolColumn
        );


    numberBRow.appendChild(
        symbol
    );


    for (
        let i = 0;
        i < length;
        i++
    ) {

        const digit =
            createDigit(
                value[i],
                startColumn + i
            );


        numberBRow.appendChild(
            digit
        );

    }

}


/* =========================================
   ضبط طول الخط
========================================= */

function setupSeparator() {

    const answer =
        String(
            currentQuestion.answer
        );


    const answerLength =
        answer.length;


    /*
       بداية الخط هي نفس بداية
       النتيجة تماماً
    */

    const lineStart =
        6 - answerLength + 1;


    separator.style.gridColumn =
        `${lineStart} / span ${answerLength}`;

}


/* =========================================
   تجهيز النتيجة
========================================= */

function setupAnswer() {

    const answer =
        String(
            currentQuestion.answer
        );


    const length =
        answer.length;


    answerValues =
        new Array(
            length
        ).fill("");


    /*
       البداية من الوحدات
       أي الرقم الموجود أقصى اليمين
    */

    currentSlot =
        length - 1;


    answerChecked =
        false;


    renderAnswer();

}


/* =========================================
   رسم خانات النتيجة
========================================= */

function renderAnswer() {

    answerRow.innerHTML =
        "";


    const length =
        answerValues.length;


    const startColumn =
        6 - length + 1;


    for (
        let i = 0;
        i < length;
        i++
    ) {

        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "answer-cell";


        cell.style.gridColumn =
            String(
                startColumn + i
            );


        /*
           الرقم موجود
        */

        if (
            answerValues[i] !== ""
        ) {

            /*
               إذا كانت الخانة الحالية
               هي التي نريد تعديلها
            */

            if (
                i === currentSlot &&
                !answerChecked
            ) {

                createEditableCell(
                    cell,
                    i
                );

            }

            else {

                cell.textContent =
                    answerValues[i];


                /*
                   يمكن الضغط على الرقم
                   لتعديله قبل التحقق
                */

                if (
                    !answerChecked
                ) {

                    cell.style.cursor =
                        "pointer";


                    cell.title =
                        "اضغط لتعديل الرقم";


                    cell.addEventListener(
                        "click",
                        () => {

                            activateDigitForEditing(
                                i
                            );

                        }
                    );

                }

            }

        }


        /*
           الخانة الحالية
        */

        else if (
            i === currentSlot
        ) {

            createEditableCell(
                cell,
                i
            );

        }


        /*
           الخانات التي لم نصل إليها
        */

        else {

            cell.textContent =
                "•";


            cell.classList.add(
                "answer-dot"
            );

        }


        answerRow.appendChild(
            cell
        );

    }

}


/* =========================================
   إنشاء مربع إدخال
========================================= */

function createEditableCell(
    cell,
    index
) {

    const input =
        document.createElement(
            "input"
        );


    input.className =
        "answer-input";


    input.type =
        "text";


    input.inputMode =
        "numeric";


    input.pattern =
        "[0-9]*";


    input.maxLength =
        1;


    input.autocomplete =
        "off";


    input.setAttribute(
        "aria-label",
        "اكتب الرقم"
    );


    /*
       إذا كان هناك رقم سابق
       نضعه داخل المربع
    */

    if (
        answerValues[index] !== ""
    ) {

        input.value =
            answerValues[index];

    }


    input.addEventListener(
        "input",
        function(event) {

            handleInput(
                event,
                index
            );

        }
    );


    input.addEventListener(
        "keydown",
        function(event) {

            handleKeyDown(
                event
            );

        }
    );


    cell.appendChild(
        input
    );


    /*
       التركيز التلقائي
    */

    setTimeout(
        () => {

            input.focus();

            input.select();

        },
        40
    );

}


/* =========================================
   الضغط على رقم لتصحيحه
========================================= */

function activateDigitForEditing(
    index
) {

    /*
       التعديل مسموح فقط
       قبل التحقق
    */

    if (
        answerChecked
    ) {

        return;

    }


    currentSlot =
        index;


    renderAnswer();

}


/* =========================================
   إدخال رقم
========================================= */

function handleInput(
    event,
    index
) {

    let value =
        event.target.value;


    /*
       أرقام فقط
    */

    value =
        value.replace(
            /[^0-9]/g,
            ""
        );


    /*
       حذف الرقم
    */

    if (
        value === ""
    ) {

        answerValues[index] =
            "";


        event.target.value =
            "";


        return;

    }


    /*
       رقم واحد فقط
    */

    value =
        value.charAt(0);


    event.target.value =
        value;


    answerValues[index] =
        value;


    /*
       الانتقال إلى الرقم
       الموجود على اليسار
    */

    currentSlot =
        index - 1;


    renderAnswer();

}


/* =========================================
   زر Enter
========================================= */

function handleKeyDown(
    event
) {

    if (
        event.key === "Enter"
    ) {

        checkAnswer();

    }

}


/* =========================================
   التحقق من الإجابة
========================================= */

function checkAnswer() {

    /*
       تثبيت الإجابة مؤقتاً
    */

    answerChecked =
        true;


    /*
       التأكد من كتابة جميع الأرقام
    */

    if (
        answerValues.some(
            value =>
                value === ""
        )
    ) {

        answerChecked =
            false;


        message.textContent =
            "أكمل كتابة النتيجة";


        message.className =
            "message wrong";


        return;

    }


    const userAnswer =
        Number(
            answerValues.join("")
        );


    const correctAnswer =
        currentQuestion.answer;


    /* =====================================
       صحيحة
    ===================================== */

    if (
        userAnswer ===
        correctAnswer
    ) {

        score++;


        message.textContent =
            "✓ إجابة صحيحة";


        message.className =
            "message correct";


        setTimeout(
            nextQuestion,
            700
        );


        return;

    }


    /* =====================================
       خاطئة
    ===================================== */

    message.textContent =
        "✗ إجابة خاطئة، يمكنك تصحيحها";


    message.className =
        "message wrong";


    /*
       السماح بالتصحيح من جديد
    */

    setTimeout(
        () => {

            answerChecked =
                false;


            /*
               لا نمسح الأرقام.
               يستطيع الطفل الضغط
               على أي رقم لتعديله.
            */

            currentSlot =
                -1;


            renderAnswer();

        },
        700
    );

}


/* =========================================
   السؤال التالي
========================================= */

function nextQuestion() {

    currentQuestionIndex++;


    if (
        currentQuestionIndex >=
        TOTAL_QUESTIONS
    ) {

        finishLevel();

        return;

    }


    showQuestion();

}


/* =========================================
   نهاية المستوى
========================================= */

function finishLevel() {

    checkAnswerButton.disabled =
        true;


    /*
       =====================================
       إكمال المستوى بنجاح
       =====================================
    */

    if (
        score ===
        TOTAL_QUESTIONS
    ) {

        const nextLevel =
            currentLevel + 1;


        /*
           فتح المستوى التالي
        */

        if (
            nextLevel <= MAX_LEVEL
        ) {

            if (
                nextLevel >
                unlockedLevel
            ) {

                unlockedLevel =
                    nextLevel;


                localStorage.setItem(
                    PROGRESS_KEY,
                    String(
                        unlockedLevel
                    )
                );

            }

        }


        /*
           رسالة تحفيزية
        */

        if (
            currentLevel <
            MAX_LEVEL
        ) {

            message.innerHTML =
                `
                🎉 أحسنت يا بطل! 🎉
                <br>
                أكملت المستوى ${currentLevel} بنجاح!
                <br>
                ⭐ استعد للمستوى ${nextLevel} ⭐
                `;

        }

        else {

            message.innerHTML =
                `
                🏆 رائع جداً! 🏆
                <br>
                لقد أكملت جميع مستويات الطرح!
                <br>
                ⭐ أنت بطل الحساب ⭐
                `;

        }


        message.className =
            "message correct";


        /*
           الانتقال التلقائي
        */

        setTimeout(
            () => {

                if (
                    currentLevel <
                    MAX_LEVEL
                ) {

                    window.location.href =
                        `subtraction.html?level=${nextLevel}`;

                }

                else {

                    /*
                       بعد المستوى 10
                       نعيد تشغيل المستوى 10
                    */

                    currentQuestionIndex =
                        0;


                    score =
                        0;


                    checkAnswerButton.disabled =
                        false;


                    questions =
                        generateQuestions();


                    showQuestion();

                }

            },
            2500
        );


        return;

    }


    /*
       =====================================
       لم يكمل المستوى
       =====================================
    */

    message.innerHTML =
        `
        النتيجة: ${score} من ${TOTAL_QUESTIONS}
        <br>
        💪 حاول مرة أخرى وستنجح!
        `;


    message.className =
        "message wrong";


    /*
       إعادة المستوى
    */

    setTimeout(
        () => {

            currentQuestionIndex =
                0;


            score =
                0;


            checkAnswerButton.disabled =
                false;


            questions =
                generateQuestions();


            showQuestion();

        },
        2500
    );

}


/* =========================================
   عرض السؤال
========================================= */

function showQuestion() {

    currentQuestion =
        questions[
            currentQuestionIndex
        ];


    levelNumber.textContent =
        currentLevel;


    questionNumber.textContent =
        currentQuestionIndex + 1;


    renderNumberA();

    renderNumberB();

    setupSeparator();

    setupAnswer();


    message.textContent =
        "";


    message.className =
        "message";

}


/* =========================================
   بدء اللعبة
========================================= */

function startGame() {

    questions =
        generateQuestions();


    currentQuestionIndex =
        0;


    score =
        0;


    showQuestion();

}


/* =========================================
   زر تحقق
========================================= */

checkAnswerButton.addEventListener(
    "click",
    checkAnswer
);


/* =========================================
   تشغيل اللعبة
========================================= */

startGame();
