"use strict";

/* =========================================
   إعدادات الضرب
========================================= */

const TOTAL_QUESTIONS = 12;

const MAX_LEVEL = 10;

const PROGRESS_KEY =
    "multiplicationUnlockedLevelV1";


/*
   عدد خانات العدد الأول
   وعدد خانات العدد الثاني
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


/* =========================================
   عناصر الصفحة
========================================= */

const levelNumber =
    document.getElementById(
        "levelNumber"
    );

const questionNumber =
    document.getElementById(
        "questionNumber"
    );

const numberA =
    document.getElementById(
        "numberA"
    );

const numberB =
    document.getElementById(
        "numberB"
    );

const answerRow =
    document.getElementById(
        "answerRow"
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
   المستوى الحالي
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

    if (digits <= 1) {

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
   إنشاء العمليات
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


        if (used.has(key)) {
            continue;
        }


        used.add(key);


        result.push({
            a,
            b,
            answer: a * b
        });

    }


    return result;

}


/* =========================================
   عرض الأرقام
========================================= */

function showQuestion() {

    currentQuestion =
        questions[
            currentQuestionIndex
        ];


    numberA.textContent =
        currentQuestion.a;

    numberB.textContent =
        currentQuestion.b;


    questionNumber.textContent =
        currentQuestionIndex + 1;


    levelNumber.textContent =
        currentLevel;


    /*
       عدد خانات النتيجة
    */

    const answerLength =
        String(
            currentQuestion.answer
        ).length;


    /*
       نضع خانة الإدخال
       في أقصى اليمين
       = خانة الوحدات
    */

    currentSlot =
        answerLength - 1;


    answerValues =
        new Array(
            answerLength
        ).fill("");


    renderAnswer();


    message.textContent =
        "";

    message.className =
        "message";

}


/* =========================================
   رسم خانات الإجابة
========================================= */

function renderAnswer() {

    answerRow.innerHTML = "";


    const length =
        answerValues.length;


    /*
       نضع النتيجة في
       آخر أعمدة الشبكة
       حتى تكون محاذية
       مع أرقام العملية.
    */

    const startColumn =
        6 - length;


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
            "answer-digit";


        cell.style.gridColumn =
            String(
                startColumn + i + 1
            );


        /*
           إذا كان الرقم قد كُتب
        */

        if (
            answerValues[i] !== ""
        ) {

            cell.textContent =
                answerValues[i];

        }


        /*
           إذا كانت هذه هي
           الخانة الحالية
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
               التركيز تلقائياً
            */

            setTimeout(
                () => {
                    input.focus();
                },
                30
            );

        }


        /*
           الخانات التي لم نصل
           إليها بعد
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
   إدخال رقم
========================================= */

function handleInput(event) {

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


    if (!value) {

        event.target.value =
            "";

        return;

    }


    value =
        value.charAt(0);


    event.target.value =
        value;


    /*
       تخزين الرقم في
       المكان الحالي
    */

    answerValues[
        currentSlot
    ] = value;


    /*
       الانتقال إلى الرقم
       الذي قبله، أي إلى اليسار
    */

    currentSlot--;


    renderAnswer();

}


/* =========================================
   زر Enter
========================================= */

function handleKeyDown(event) {

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
       هل بقيت خانات فارغة؟
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
            "✗ حاول مرة أخرى";

        message.className =
            "message wrong";


        /*
           إعادة فتح الخانات
           حتى يتمكن الطفل من التصحيح
        */

        setTimeout(
            () => {

                const length =
                    answerValues.length;


                /*
                   نرجع إلى الوحدات
                */

                currentSlot =
                    length - 1;


                answerValues =
                    new Array(
                        length
                    ).fill("");


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

    if (
        score ===
        TOTAL_QUESTIONS
    ) {

        /*
           فتح المستوى التالي
        */

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
            `🎉 أحسنت! النتيجة ${score} من ${TOTAL_QUESTIONS}`;

        message.className =
            "message correct";


    }

    else {

        message.textContent =
            `النتيجة ${score} من ${TOTAL_QUESTIONS}`;

        message.className =
            "message wrong";

    }


    checkAnswerButton.disabled =
        true;


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
   تشغيل اللعبة
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
   بدء اللعبة
========================================= */

startGame();
