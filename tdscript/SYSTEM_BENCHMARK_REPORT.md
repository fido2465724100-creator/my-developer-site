# 🏆 TDscript Comprehensive System Benchmark Report
## Базовые системные тесты производительности и стресс-тесты на отказоустойчивость

**Дата проведения**: 2026-11-25T21:15:03.500885782
**Аппаратная платформа**: Linux x86_64, NVIDIA GeForce GTX 1070 (8GB), Host GCC 15.2, Python 3.14, Lua 5.4, Node 20.20, Kotlin JVM 1.9 (Java 17)
**Языковые среды**: TDscript Core 1.1, Python 3.14, Lua 5.4, Node.js 20, C++ 15, Kotlin JVM

### 1. Задержка холодного старта (Cold Start Latency — 50 итераций)
> [!NOTE]
> Разделены режимы **In-Process VM** (встроенная инициализация в хост-процессе: 0.16 мс) и **CLI Subprocess spawn** (холодный старт отдельного процесса ОС: 115.24 мс с бутстрапом Java 17 JRE, разбором AST и исполнением скрипта).
> **Профилирование 115 мс CLI Subprocess spawn**:
> - Базовый старт лаунчера JVM (`java -version`, без AppClassLoader и байткода): **29.4 мс**
> - Инициализация JVM `java.base` + `AppClassLoader` (пустой класс `main()`): **49.7 мс**
> - Загрузка рантайма Kotlin stdlib и рефлексии: **16.2 мс**
> - Загрузка классов парсера AST TDscript (`Lexer`, `Parser`, `Interpreter`, `HostSPI`): **49.2 мс**
> - Разбор AST и выполнение скрипта `let x = 1;`: **0.16 мс**

| Рантайм / Языковая среда | Режим запуска | Min (мс) | P50 Медиана (мс) | Mean (мс) | P95 (мс) | Max (мс) | Архитектурная заметка |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **TDscript (In-Process VM)** | In-Process VM (Pre-warmed JVM) | 0,10 | **0,16** | 0,17 | 0,27 | 0,34 | Zero process spawn overhead; direct AST instantiation in embedded host |
| **TDscript (CLI Subprocess spawn)** | CLI Subprocess spawn (Java 17 JRE boot) | 100,72 | **112,99** | 112,87 | 123,66 | 127,78 | Full OS process launch: Java 17 JVM boot + TDscript AST parser & interpreter cold start |
| **C++ Native (g++ -O2)** | CLI Subprocess spawn (ELF binary) | 1,18 | **2,10** | 2,10 | 2,47 | 2,59 | Static native binary without VM runtime overhead |
| **Lua 5.4** | CLI Subprocess spawn (C runtime) | 2,08 | **2,92** | 2,93 | 3,30 | 3,34 | Compact C-based interpreter startup |
| **Python 3.14** | CLI Subprocess spawn (CPython) | 12,95 | **21,32** | 20,10 | 22,23 | 23,84 | CPython interpreter boot and core module load |
| **JavaScript (Node.js 20)** | CLI Subprocess spawn (V8 engine) | 24,01 | **32,02** | 33,10 | 46,02 | 47,56 | V8 engine bootstrap, libuv event loop initialization |
| **Kotlin / Java JVM** | CLI Subprocess spawn (JVM boot) | 24,79 | **28,90** | 29,88 | 35,93 | 40,51 | Standard bare JVM process cold start (java -version) |

### 2. Вычислительная пропускная способность и скорость циклов (1M & 10M)
> [!NOTE]
> В тестах C++ переменные цикла объявлены как `volatile`. В Node.js переменные цикла размещены в типизированном массиве `Float64Array(2)` для исключения свёртки цикла компилятором TurboFan в аналитическую формулу и принуждения к реальным операциям с памятью кучи на каждой итерации (аналогично `volatile` в C++). Для TDscript выполнен замер как на 1M, так и на 10M итераций (граница Step Limiter).

| Рантайм | Итераций | Время (мс) | Скорость (ops/sec) | Контрольная сумма | Валидация | Особенности оптимизации |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **C++ Native (-O2 + volatile memory)** | 1 000 000 | **5 ms** | 220 896 841 | `249999000000` | ✅ PASS | Enforced volatile variables force CPU memory access per iteration (no DCE, no closed-form) |
| **C++ Native (-O2 + volatile memory)** | 10 000 000 | **27 ms** | 376 477 674 | `24999990000000` | ✅ PASS | Enforced volatile variables force CPU memory access per iteration (no DCE, no closed-form) |
| **Lua 5.4** | 1 000 000 | **19 ms** | 52 631 578 | `249999000000` | ✅ PASS | Bytecode register VM without JIT |
| **Lua 5.4** | 10 000 000 | **237 ms** | 42 194 092 | `24999990000000` | ✅ PASS | Bytecode register VM without JIT |
| **JavaScript (Node.js 20 V8)** | 1 000 000 | **8 ms** | 125 000 000 | `249999000000` | ✅ PASS | V8 TurboFan with Float64Array typed memory (enforces memory access, prevents closed-form scalar folding) |
| **JavaScript (Node.js 20 V8)** | 10 000 000 | **86 ms** | 116 279 069 | `24999990000000` | ✅ PASS | V8 TurboFan with Float64Array typed memory (enforces memory access, prevents closed-form scalar folding) |
| **Python 3.14** | 1 000 000 | **160 ms** | 6 250 000 | `249999000000` | ✅ PASS | Standard CPython 3.14 bytecode evaluation loop |
| **Python 3.14** | 10 000 000 | **1662 ms** | 6 016 847 | `24999990000000` | ✅ PASS | Standard CPython 3.14 bytecode evaluation loop |
| **TDscript (In-Process VM)** | 1 000 000 | **324 ms** | 3 086 419 | `249999000000` | ✅ PASS | Tree-walk AST interpreter with per-statement StepLimiter check (15000000 step budget) |
| **TDscript (In-Process VM)** | 10 000 000 | **2053 ms** | 4 870 920 | `24999990000000` | ✅ PASS | Tree-walk AST interpreter with per-statement StepLimiter check (120000000 step budget) |

### 3. Потребление оперативной памяти (RSS RAM) и размер дистрибутива
> [!NOTE]
> Размер TDscript Core JAR составляет всего 135 КБ. В режиме In-Process дельта памяти кучи составляет 3.1 МБ (страницы хоста разделяемы, базовая память JVM не приписывается скрипту). В режиме CLI с JRE 17 процесс занимает 38.2 МБ RSS.
> `*` *In-Process Peak RSS (4.3 МБ) отражает дельту аллокации кучи (Heap Delta: 3.1 МБ) внутри работающего хост-демона; базовая память разделяемых страниц JVM не атрибутируется скрипту.*

| Язык / Рантайм | Размер бинарника / JAR | Idle RSS (МБ) | Peak RSS (МБ) | Дельта памяти (МБ) | Архитектурная заметка |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **TDscript (In-Process Host)*** | **135 КБ** | 1.2 | 4.3 | 3.1 | Standalone JAR 135 KB. In-process heap allocation delta in pre-warmed host |
| **TDscript (CLI Subprocess)** | **35.1 МБ** | 31.5 | 38.2 | 6.7 | Standalone OS process mode: includes base Java 17 JRE 64-bit runtime pages |
| **Lua 5.4** | **298 КБ** | 2.4 | 4.8 | 2.4 | Ultra-compact static ANSI C executable |
| **Python 3.14 (+StdLib 56MB)** | **63.1 МБ** | 14.8 | 26.5 | 11.7 | Binary 7.2 MB + Python 3.14 standard library 56 MB |
| **JavaScript (Node.js 20)** | **94.3 МБ** | 34.2 | 58.6 | 24.4 | Standalone V8 binary (95 MB) + internal heap heap-allocator |

`*` *In-Process Peak RSS (4.3 МБ) — дельта кучи в pre-warmed host, страницы JVM разделяемы.*

### 4. Аппаратная безопасность и изоляция песочницы
| Сценарий безопасности | Статус | Физических вызовов шины | Код ошибки | Аварийный останов | Механизм защиты |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **I2C Bus Address Whitelist** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `E104@line:col` | — | Reading from allowed 0x76 returns byte data; read to 0x68 strictly blocked before hardware dispatch (busCalls=0). |
| **Modbus PLC Register Whitelist** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `E104@scope:modbus` | — | Reading register 100 succeeds (245); register 999 blocked at scope boundary (busCalls=0). |
| **Serial Port Scope Whitelist** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `SCOPE_VIOLATION:serial` | — | Opening unapproved serial port /dev/ttyUSB99 blocked at HostSPI boundary (busCalls=0). |
| **Step Limiter DoS Protection** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `TDS_E106` | 🚨 Вызван | Execution terminated strictly at 100,001 steps in 27ms, triggering host.emergencyStop() with zero CPU hang. |
| **Host OS Sandbox Escape Denial** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `COMPILER_REJECT` | — | Grammar strictly isolates the script from JVM reflection, host process spawning, and OS access. |
| **Granular Capability Bitmask** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `PERMISSION_DENIED:I2C_WRITE` | — | Driver granted read-only rights is rejected before issuing I2C write transaction. |

### 5. Стресс-тестирование аппаратных сбоев (Hardware Fault Injection)
| Тип сбоя | Точка инжекции | Ожидаемое поведение | Фактический результат | Состояние шины | Краш процесса |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **I2C Bus NACK / Arbitration Loss** | Transaction #1 on register 0xD0 read | Return null to script, log diagnostic error, activate fallback branch | Returned null, fallback executed, zero process crash | `CLEAN_CLOSED_NO_HANG` | 🛡️ НЕТ (0 крашей) |
| **Modbus TCP Gateway Timeout** | Transaction #1 on register 100 polling | Return -1 error code, maintain fail-safe state | Returned -1, safeState engaged, zero process crash | `SOCKET_CLOSED_SAFE` | 🛡️ НЕТ (0 крашей) |
| **BLE Connection Loss Mid-Stream** | Transaction #1 on btReadLine() streaming | Return null string, increment retry counter, clean GATT handle | Returned null, retry counter incremented, zero crash | `RADIO_DISCONNECTED_SAFE` | 🛡️ НЕТ (0 крашей) |

### 6. Соответствие спецификации языка TDscript (60 тестов)
- **Всего тестов**: **60** (Успешно: **60** / 100.0%)
- **Позитивные тесты (Positive)**: **42** (70,0%)
- **Негативные тесты (Negative, отказ невалидного кода)**: **18** (30,0%)
- **Разбивка по компонентам**: Lexer (13), Parser (11), Runtime (29), Security (5), Diagnostics (2)
- **Формальная грамматика GBNF (`grammar.gbnf`)**: ✅ ВЕРИФИЦИРОВАНА (2000/2000 (1000/1000 valid accepted, 1000/1000 invalid rejected — 100.0% bidirectional conformance))

