"use strict";


/* =========================================
   إعدادات اللعبة
========================================= */

const TOTAL_QUESTIONS = 12;

const MAX_LEVEL = 10;

const PROGRESS_KEY =
    "multiplicationUnlockedLevelV1";


/* =========================================
   مستويات الضرب
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
   المستوى
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


let currentLevel =
    Math.max(
        1,
        Math.min(
            requestedLevel,
            MAX_LEVEL
        )
    );


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


/* =========================================
   إنشاء رقم عشوائي
========================================= */

function randomNumber(
    digits
) {

    if (digits === 1) {

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
   إنشاء 12 عملية بدون تكرار
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


        const key =
            `${a}x${b}`;


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
                a * b

        });

    }


    return result;
}


/* =========================================
   إنشاء رقم داخل عمود محدد
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
        String(column);


    return element;
}


/* =========================================
   رسم العدد الأول
========================================= */

function renderNumberA() {

    numberARow.innerHTML = "";


    const value =
        String(
            currentQuestion.a
        );


    const length =
        value.length;


    /*
       المحاذاة من اليمين.

       إذا كان العدد:
       2

       سيكون في العمود 6.

       إذا كان:
       24

       سيكون في العمودين 5 و 6.
    */

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
   رسم العدد الثاني وعلامة الضرب
========================================= */

function renderNumberB() {

    numberBRow.innerHTML = "";


    const value =
        String(
            currentQuestion.b
        );


    const length =
        value.length;


    const startColumn =
        6 - length + 1;


    /*
       علامة الضرب تكون مباشرة
       إلى يسار العدد الثاني.
    */

    const symbolColumn =
        startColumn - 1;


    const symbol =
        document.createElement(
            "div"
        );


    symbol.className =
        "multiply-symbol";


    symbol.textContent =
        "×";


    symbol.style.gridColumn =
        String(
            symbolColumn
        );


    numberBRow.appendChild(
        symbol
    );


    /*
       رسم أرقام العدد الثاني
    */

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
   تحديد طول الخط حسب النتيجة
========================================= */

function setupSeparator() {

    const answer =
        String(
            currentQuestion.answer
        );


    const answerLength =
        answer.length;


    /*
       النتيجة دائماً تبدأ من
       اليمين.

       مثال:

       16

       العمود 5 + العمود 6

       312

       العمود 4 + 5 + 6
    */

    const lineStart =
        6 - answerLength + 1;


    operationBoard.style.setProperty(
        "--answer-length",
        answerLength
    );


    operationBoard.style.setProperty(
        "--line-start",
        lineStart
    );

}


/* =========================================
   تجهيز خانات النتيجة
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
       البداية دائماً من خانة الوحدات
       أي أقصى اليمين.
    */

    currentSlot =
        length - 1;


    renderAnswer();

}


/* =========================================
   رسم النتيجة
========================================= */

function renderAnswer() {

    answerRow.innerHTML = "";


    const length =
        answerValues.length;


    /*
       النتيجة محاذية تماماً
       مع الأرقام الموجودة فوقها.
    */

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
           الرقم الذي تمت كتابته
        */

        if (
            answerValues[i] !== ""
        ) {

            cell.textContent =
                answerValues[i];

        }


        /*
           خانة الكتابة الحالية
        */

        else if (
            i === currentSlot
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


            input.addEventListener(
                "input",
                handleInput
            );


            input.addEventListener(
                "keydown",
                handleKeyDown
            );


            cell.appendChild(
                input
            );


            /*
               فتح لوحة الأرقام
               والتركيز مباشرة
            */

            setTimeout(
                () => {

                    input.focus();

                },
                50
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
   عند كتابة الرقم
========================================= */

function handleInput(
    event
) {

    let value =
        event.target.value;


    /*
       السماح بالأرقام فقط
    */

    value =
        value.replace(
            /[^0-9]/g,
            ""
        );


    if (
        value === ""
    ) {

        event.target.value =
            "";

        return;
    }


    value =
        value.charAt(0);


    event.target.value =
        value;


    /*
       تخزين الرقم في الخانة الحالية
    */

    answerValues[
        currentSlot
    ] = value;


    /*
       الانتقال خانة إلى اليسار
    */

    currentSlot--;


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
       لا يمكن التحقق قبل
       ملء جميع الخانات
    */

    if (
        answerValues.some(
            value =>
                value === ""
        )
    ) {

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

    }

    else {

        message.textContent =
            "✗ إجابة خاطئة، حاول مرة أخرى";

        message.className =
            "message wrong";


        setTimeout(
            () => {

                const length =
                    answerValues.length;


                answerValues =
                    new Array(
                        length
                    ).fill("");


                currentSlot =
                    length - 1;


                renderAnswer();

            },
            900
        );

    }

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
   إنهاء المستوى
========================================= */

function finishLevel() {

    checkAnswerButton.disabled =
        true;


    if (
        score ===
        TOTAL_QUESTIONS
    ) {

        if (
            currentLevel <
            MAX_LEVEL
        ) {

            const nextLevel =
                currentLevel + 1;


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


        message.textContent =
            `🎉 أحسنت! ${score} من ${TOTAL_QUESTIONS}`;

        message.className =
            "message correct";

    }

    else {

        message.textContent =
            `النتيجة ${score} من ${TOTAL_QUESTIONS}`;

        message.className =
            "message wrong";

    }


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
   عرض العملية
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
   زر التحقق
========================================= */

checkAnswerButton.addEventListener(
    "click",
    checkAnswer
);


/* =========================================
   تشغيل اللعبة
========================================= */

startGame();
