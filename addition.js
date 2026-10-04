const TOTAL_QUESTIONS = 12;

const MAX_LEVEL = 10;


/*
 * مفتاح التقدم الجديد
 */

const PROGRESS_KEY =
    "additionUnlockedLevelV2";


/*
 * شكل الأعداد في كل مستوى
 *
 * [عدد أرقام العدد الأول,
 *  عدد أرقام العدد الثاني]
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


let currentLevel = 1;

let currentQuestion = 1;

let score = 0;

let numberA = 0;

let numberB = 0;

let questions = [];

let answers = [];


/*
 * قراءة المستوى من الرابط
 */

const params =
    new URLSearchParams(
        window.location.search
    );

const requestedLevel =
    parseInt(
        params.get("level")
    );


/*
 * المستوى المفتوح
 */

let unlockedLevel =
    parseInt(
        localStorage.getItem(
            PROGRESS_KEY
        )
    );


if (
    isNaN(unlockedLevel) ||
    unlockedLevel < 1
) {

    unlockedLevel = 1;

    localStorage.setItem(
        PROGRESS_KEY,
        "1"
    );

}


/*
 * التأكد من أن المستوى المطلوب مفتوح
 */

if (
    !isNaN(requestedLevel) &&
    requestedLevel >= 1 &&
    requestedLevel <= unlockedLevel
) {

    currentLevel =
        requestedLevel;

}


/*
 * العناصر
 */

const numberAElement =
    document.getElementById(
        "numberA"
    );

const numberBElement =
    document.getElementById(
        "numberB"
    );

const answerElement =
    document.getElementById(
        "answer"
    );

const checkAnswerButton =
    document.getElementById(
        "checkAnswer"
    );

const messageElement =
    document.getElementById(
        "message"
    );

const levelNumberElement =
    document.getElementById(
        "levelNumber"
    );

const questionNumberElement =
    document.getElementById(
        "questionNumber"
    );

const scoreElement =
    document.getElementById(
        "score"
    );

const levelTitleElement =
    document.getElementById(
        "levelTitle"
    );

const additionCard =
    document.getElementById(
        "additionCard"
    );

const resultCard =
    document.getElementById(
        "resultCard"
    );

const resultSummary =
    document.getElementById(
        "resultSummary"
    );

const reviewList =
    document.getElementById(
        "reviewList"
    );

const unlockMessage =
    document.getElementById(
        "unlockMessage"
    );

const notUnlockedMessage =
    document.getElementById(
        "notUnlockedMessage"
    );

const retryLevel =
    document.getElementById(
        "retryLevel"
    );

const backToLevels =
    document.getElementById(
        "backToLevels"
    );

const celebration =
    document.getElementById(
        "celebration"
    );


/*
 * إنشاء رقم حسب عدد الأرقام
 */

function generateNumber(digits) {

    const minimum =
        Math.pow(
            10,
            digits - 1
        );

    const maximum =
        Math.pow(
            10,
            digits
        ) - 1;


    return Math.floor(
        Math.random() *
        (maximum - minimum + 1)
    ) + minimum;

}


/*
 * خلط المصفوفة
 */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }

    return array;

}


/*
 * إنشاء 12 عملية مختلفة
 */

function createQuestions() {

    const digits =
        levelDigits[
            currentLevel
        ];


    const digitsA =
        digits[0];

    const digitsB =
        digits[1];


    const used =
        new Set();


    questions = [];


    /*
     * نواصل إنشاء العمليات
     * حتى نحصل على 12 عملية مختلفة
     */

    while (
        questions.length <
        TOTAL_QUESTIONS
    ) {

        const a =
            generateNumber(
                digitsA
            );

        const b =
            generateNumber(
                digitsB
            );


        /*
         * مفتاح العملية
         */

        const key =
            a + "+" + b;


        /*
         * منع تكرار نفس العملية
         */

        if (
            used.has(key)
        ) {

            continue;

        }


        /*
         * منع تكرار نفس العدد
         * عندما يكون العددان من نفس
         * عدد الأرقام
         *
         * مثال:
         * 5 + 5
         * 24 + 24
         */

        if (
            digitsA === digitsB &&
            a === b
        ) {

            continue;

        }


        used.add(key);


        questions.push({

            a: a,

            b: b,

            answer: a + b

        });

    }


    shuffle(
        questions
    );

}


/*
 * عرض العملية
 */

function createQuestion() {

    const question =
        questions[
            currentQuestion - 1
        ];


    numberA =
        question.a;

    numberB =
        question.b;


    numberAElement.textContent =
        numberA;

    numberBElement.textContent =
        numberB;


    levelNumberElement.textContent =
        currentLevel;


    questionNumberElement.textContent =
        currentQuestion;


    levelTitleElement.textContent =
        "المستوى " +
        currentLevel;


    answerElement.value =
        "";


    answerElement.disabled =
        false;


    checkAnswerButton.disabled =
        false;


    messageElement.textContent =
        "";


    messageElement.className =
        "message";


    answerElement.focus();

}


/*
 * التحقق من الإجابة
 */

function checkAnswer() {

    /*
     * لا نسمح بإجابة فارغة
     */

    if (
        answerElement.value.trim() === ""
    ) {

        messageElement.textContent =
            "✏️ اكتب الإجابة أولاً";

        messageElement.className =
            "message wrong";

        answerElement.focus();

        return;

    }


    const userAnswer =
        Number(
            answerElement.value
        );


    const correctAnswer =
        numberA + numberB;


    const isCorrect =
        userAnswer ===
        correctAnswer;


    /*
     * تسجيل الإجابة
     */

    answers.push({

        numberA:
            numberA,

        numberB:
            numberB,

        userAnswer:
            userAnswer,

        correctAnswer:
            correctAnswer,

        isCorrect:
            isCorrect

    });


    /*
     * النقاط
     */

    if (isCorrect) {

        score += 10;

        scoreElement.textContent =
            score;


        messageElement.textContent =
            "✅ صحيح!";


        messageElement.className =
            "message correct";

    } else {

        messageElement.textContent =
            "❌ غير صحيح";

        messageElement.className =
            "message wrong";

    }


    /*
     * منع تعديل الإجابة
     */

    answerElement.disabled =
        true;

    checkAnswerButton.disabled =
        true;


    /*
     * الانتقال التلقائي
     * إلى العملية التالية
     */

    setTimeout(

        function () {

            if (
                currentQuestion <
                TOTAL_QUESTIONS
            ) {

                currentQuestion++;

                createQuestion();

            } else {

                finishLevel();

            }

        },

        600

    );

}


/*
 * إنهاء المستوى
 */

function finishLevel() {

    const correctCount =
        answers.filter(
            item =>
                item.isCorrect
        ).length;


    const allCorrect =
        correctCount ===
        TOTAL_QUESTIONS;


    /*
     * إخفاء العمليات
     */

    additionCard.style.display =
        "none";


    /*
     * إظهار النتيجة
     */

    resultCard.style.display =
        "block";


    /*
     * النتيجة
     */

    resultSummary.innerHTML =

        "⭐ النقاط: " +
        score +
        " / " +
        (TOTAL_QUESTIONS * 10) +

        "<br><br>" +

        "✅ الإجابات الصحيحة: " +
        correctCount +
        " / " +
        TOTAL_QUESTIONS;


    /*
     * عرض جميع الإجابات
     */

    showReview();


    /*
     * نجاح كامل
     */

    if (allCorrect) {

        unlockMessage.style.display =
            "block";

        notUnlockedMessage.style.display =
            "none";


        /*
         * فتح المستوى التالي
         */

        if (
            currentLevel <
            MAX_LEVEL
        ) {

            const nextLevel =
                currentLevel + 1;


            const currentUnlocked =
                parseInt(
                    localStorage.getItem(
                        PROGRESS_KEY
                    )
                ) || 1;


            if (
                nextLevel >
                currentUnlocked
            ) {

                localStorage.setItem(
                    PROGRESS_KEY,
                    nextLevel.toString()
                );

            }


            unlockMessage.innerHTML =

                "🎉 أحسنت يا بطل!" +
                "<br><br>" +

                "⭐ لقد أجبت عن جميع العمليات بشكل صحيح!" +
                "<br>" +

                "🔓 تم فتح المستوى " +
                nextLevel +
                "!";

        }

        else {

            unlockMessage.innerHTML =

                "🏆🎉 رائع جدًا!" +
                "<br><br>" +

                "لقد أكملت جميع مستويات الجمع العشرة!";

        }


        /*
         * تشغيل الاحتفال
         */

        startCelebration();


    }

    /*
     * لم ينجح بالكامل
     */

    else {

        unlockMessage.style.display =
            "none";

        notUnlockedMessage.style.display =
            "block";

    }

}


/*
 * مراجعة الإجابات
 */

function showReview() {

    reviewList.innerHTML =
        "";


    answers.forEach(

        function (
            item,
            index
        ) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                item.isCorrect

                    ? "review-item correct-answer"

                    : "review-item wrong-answer";


            const status =
                item.isCorrect

                    ? "✅ صحيحة"

                    : "❌ خاطئة";


            div.innerHTML = `

                <div>

                    <strong>
                        العملية ${index + 1}
                    </strong>

                    <div
                        class="review-operation"
                    >

                        ${item.numberA}
                        +
                        ${item.numberB}
                        =
                        ${item.correctAnswer}

                    </div>

                </div>


                <div>

                    إجابتك:

                    <strong>
                        ${item.userAnswer}
                    </strong>

                </div>


                <div class="review-status">

                    ${status}

                </div>


                ${
                    item.isCorrect
                    ? ""
                    : `
                        <div>

                            الإجابة الصحيحة:

                            <strong>
                                ${item.correctAnswer}
                            </strong>

                        </div>
                    `
                }

            `;


            reviewList.appendChild(
                div
            );

        }

    );

}


/*
 * ================================
 * صوت التصفيق
 * ================================
 *
 * لا يحتاج إلى ملف MP3 خارجي.
 * يتم توليده بواسطة المتصفح.
 */

function playApplause() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            return;
        }


        const audioContext =
            new AudioContext();


        /*
         * مجموعة من التصفيقات
         */

        for (
            let i = 0;
            i < 35;
            i++
        ) {

            const start =
                audioContext.currentTime +
                Math.random() * 2;


            const duration =
                0.04 +
                Math.random() * 0.08;


            const buffer =
                audioContext.createBuffer(
                    1,
                    audioContext.sampleRate *
                    duration,
                    audioContext.sampleRate
                );


            const data =
                buffer.getChannelData(0);


            for (
                let j = 0;
                j < data.length;
                j++
            ) {

                data[j] =
                    (
                        Math.random() * 2
                    ) - 1;

            }


            const source =
                audioContext.createBufferSource();


            const gain =
                audioContext.createGain();


            source.buffer =
                buffer;


            gain.gain.setValueAtTime(
                0,
                start
            );


            gain.gain.linearRampToValueAtTime(
                0.35,
                start + 0.005
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                start + duration
            );


            source.connect(gain);

            gain.connect(
                audioContext.destination
            );


            source.start(
                start
            );

            source.stop(
                start + duration
            );

        }


        setTimeout(
            function () {

                audioContext.close();

            },
            3500
        );

    }

    catch (error) {

        console.log(
            "Audio error:",
            error
        );

    }

}


/*
 * ================================
 * النجوم والمفرقعات
 * ================================
 */

function startCelebration() {

    celebration.style.display =
        "block";


    /*
     * صوت التصفيق
     */

    playApplause();


    /*
     * نجوم
     */

    const stars = [
        "⭐",
        "🌟",
        "✨",
        "💫",
        "🎉"
    ];


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );


        particle.className =
            "celebration-particle";


        particle.textContent =
            stars[
                Math.floor(
                    Math.random() *
                    stars.length
                )
            ];


        particle.style.setProperty(
            "--x",
            Math.random() * 100 + "%"
        );


        particle.style.setProperty(
            "--y",
            (35 + Math.random() * 25) + "%"
        );


        particle.style.setProperty(
            "--dx",
            (
                (Math.random() - 0.5) *
                500
            ) + "px"
        );


        particle.style.setProperty(
            "--dy",
            (
                -100 -
                Math.random() * 500
            ) + "px"
        );


        particle.style.setProperty(
            "--rotate",
            (
                Math.random() * 720
            ) + "deg"
        );


        particle.style.setProperty(
            "--size",
            (
                18 +
                Math.random() * 25
            ) + "px"
        );


        particle.style.setProperty(
            "--duration",
            (
                1.5 +
                Math.random() * 2
            ) + "s"
        );


        celebration.appendChild(
            particle
        );


        setTimeout(

            function () {

                particle.remove();

            },

            4000

        );

    }


    /*
     * مفرقعات متعددة
     */

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        setTimeout(

            function () {

                createFirework();

            },

            i * 300

        );

    }


    /*
     * إخفاء الاحتفال
     */

    setTimeout(

        function () {

            celebration.style.display =
                "none";

            celebration.innerHTML = `

                <div class="celebration-title">

                    🎉 أحسنت يا بطل! 🎉

                    <br>

                    ⭐ ممتاز! ⭐

                </div>

            `;

        },

        5000

    );

}


/*
 * إنشاء مفرقعة
 */

function createFirework() {

    const firework =
        document.createElement(
            "div"
        );


    firework.className =
        "firework";


    firework.style.left =
        (
            15 +
            Math.random() * 70
        ) + "%";


    firework.style.top =
        (
            15 +
            Math.random() * 50
        ) + "%";


    firework.style.background =
        "white";


    celebration.appendChild(
        firework
    );


    setTimeout(

        function () {

            firework.remove();

        },

        1200

    );

}


/*
 * إعادة المستوى
 */

retryLevel.addEventListener(

    "click",

    function () {

        currentQuestion = 1;

        score = 0;

        answers = [];

        createQuestions();


        scoreElement.textContent =
            "0";


        resultCard.style.display =
            "none";


        additionCard.style.display =
            "block";


        createQuestion();

    }

);


/*
 * العودة للمستويات
 */

backToLevels.addEventListener(

    "click",

    function () {

        window.location.href =
            "addition-levels.html";

    }

);


/*
 * زر Enter
 */

answerElement.addEventListener(

    "keydown",

    function (event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            checkAnswer();

        }

    }

);


/*
 * بدء المستوى
 */

createQuestions();

createQuestion();
