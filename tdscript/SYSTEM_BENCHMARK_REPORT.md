# 🏆 TDscript Comprehensive System Benchmark Report
## Базовые системные тесты производительности и стресс-тесты на отказоустойчивость

**Дата проведения**: 2026-11-25T20:13:32.962313957
**Аппаратная платформа**: Linux x86_64, NVIDIA GeForce GTX 1070 (8GB), Host GCC 15.2, Python 3.14, Lua 5.4, Node 20.20, Kotlin JVM 1.9 (Java 17)
**Языковые среды**: TDscript Core 1.1, Python 3.14, Lua 5.4, Node.js 20, C++ 15, Kotlin JVM

### 1. Задержка холодного старта (Cold Start Latency — 50 итераций)
> [!NOTE]
> Разделены режимы **In-Process VM** (встроенная инициализация в хост-процессе без спавна ОС) и **CLI Subprocess spawn** (запуск отдельного процесса ОС с бутстрапом рантайма).

| Рантайм / Языковая среда | Режим запуска | Min (мс) | P50 Медиана (мс) | Mean (мс) | P95 (мс) | Max (мс) | Архитектурная заметка |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **TDscript (In-Process VM)** | In-Process VM (Pre-warmed JVM) | 0,12 | **0,17** | 0,18 | 0,25 | 0,35 | Zero process spawn overhead; direct AST instantiation in embedded host |
| **TDscript (CLI Subprocess spawn)** | CLI Subprocess spawn (Java 17 JRE boot) | 134,95 | **156,16** | 155,24 | 167,95 | 175,65 | Full OS process launch including Java 17 JVM bootstrap |
| **C++ Native (g++ -O2)** | CLI Subprocess spawn (ELF binary) | 1,11 | **2,01** | 1,86 | 2,49 | 2,59 | Static native binary without VM runtime overhead |
| **Lua 5.4** | CLI Subprocess spawn (C runtime) | 1,72 | **2,95** | 2,74 | 3,65 | 3,72 | Compact C-based interpreter startup |
| **Python 3.14** | CLI Subprocess spawn (CPython) | 13,21 | **18,93** | 18,29 | 23,32 | 24,10 | CPython interpreter boot and core module load |
| **JavaScript (Node.js 20)** | CLI Subprocess spawn (V8 engine) | 23,65 | **30,86** | 31,90 | 47,63 | 55,54 | V8 engine bootstrap, libuv event loop initialization |
| **Kotlin / Java JVM** | CLI Subprocess spawn (JVM boot) | 26,42 | **29,88** | 31,24 | 38,85 | 50,14 | Standard JVM process cold start |

### 2. Вычислительная пропускная способность и скорость циклов (1M & 10M)
> [!NOTE]
> В тестах C++ добавлен барьер памяти `asm volatile` для предотвращения dead-code elimination (DCE). В Node.js добавлен прогрев JIT (100k итераций). Для TDscript выполнен замер как на 1M, так и на 10M итераций (граница Step Limiter).

| Рантайм | Итераций | Время (мс) | Скорость (ops/sec) | Контрольная сумма | Валидация | Особенности оптимизации |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **C++ Native (-O2 + asm barrier)** | 1 000 000 | **1 ms** | 2 028 397 565 | `249999000000` | ✅ PASS | Enforced per-iteration asm volatile memory barrier (no dead-code elimination) |
| **C++ Native (-O2 + asm barrier)** | 10 000 000 | **5 ms** | 1 819 836 214 | `24999990000000` | ✅ PASS | Enforced per-iteration asm volatile memory barrier (no dead-code elimination) |
| **Lua 5.4** | 1 000 000 | **27 ms** | 37 037 037 | `249999000000` | ✅ PASS | Bytecode register VM without JIT |
| **Lua 5.4** | 10 000 000 | **190 ms** | 52 631 578 | `24999990000000` | ✅ PASS | Bytecode register VM without JIT |
| **JavaScript (Node.js 20 V8)** | 1 000 000 | **5 ms** | 200 000 000 | `249999000000` | ✅ PASS | V8 TurboFan JIT compiler with 100k iteration warm-up |
| **JavaScript (Node.js 20 V8)** | 10 000 000 | **14 ms** | 714 285 714 | `24999990000000` | ✅ PASS | V8 TurboFan JIT compiler with 100k iteration warm-up |
| **Python 3.14** | 1 000 000 | **175 ms** | 5 714 285 | `249999000000` | ✅ PASS | Standard CPython 3.14 bytecode evaluation loop |
| **Python 3.14** | 10 000 000 | **1724 ms** | 5 800 464 | `24999990000000` | ✅ PASS | Standard CPython 3.14 bytecode evaluation loop |
| **TDscript (In-Process VM)** | 1 000 000 | **335 ms** | 2 985 074 | `249999000000` | ✅ PASS | Tree-walk AST interpreter with per-statement StepLimiter check (15000000 step budget) |
| **TDscript (In-Process VM)** | 10 000 000 | **2112 ms** | 4 734 848 | `24999990000000` | ✅ PASS | Tree-walk AST interpreter with per-statement StepLimiter check (120000000 step budget) |

### 3. Потребление оперативной памяти (RSS RAM) и размер дистрибутива
> [!NOTE]
> Размер TDscript Core JAR составляет всего 135 КБ. В режиме In-Process дельта памяти составляет 5.2 МБ (страницы хоста разделяемы). В режиме CLI с JRE 17 процесс занимает 38.2 МБ RSS.

| Язык / Рантайм | Размер бинарника / JAR | Idle RSS (МБ) | Peak RSS (МБ) | Дельта памяти (МБ) | Архитектурная заметка |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **TDscript (In-Process Host)** | **135 КБ** | 1.2 | 4.3 | 3.1 | Standalone JAR 135 KB. In-process heap allocation delta in pre-warmed host |
| **TDscript (CLI Subprocess)** | **35.1 МБ** | 31.5 | 38.2 | 6.7 | Standalone OS process mode: includes base Java 17 JRE 64-bit runtime pages |
| **Lua 5.4** | **298 КБ** | 2.4 | 4.8 | 2.4 | Ultra-compact static ANSI C executable |
| **Python 3.14 (+StdLib 56MB)** | **63.1 МБ** | 14.8 | 26.5 | 11.7 | Binary 7.2 MB + Python 3.14 standard library 56 MB |
| **JavaScript (Node.js 20)** | **94.3 МБ** | 34.2 | 58.6 | 24.4 | Standalone V8 binary (95 MB) + internal heap heap-allocator |

### 4. Аппаратная безопасность и изоляция песочницы
| Сценарий безопасности | Статус | Физических вызовов шины | Код ошибки | Аварийный останов | Механизм защиты |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **I2C Bus Address Whitelist** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `E104@line:col` | — | Reading from allowed 0x76 returns byte data; read to 0x68 strictly blocked before hardware dispatch (busCalls=0). |
| **Modbus PLC Register Whitelist** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `E104@scope:modbus` | — | Reading register 100 succeeds (245); register 999 blocked at scope boundary (busCalls=0). |
| **Serial Port Scope Whitelist** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `SCOPE_VIOLATION:serial` | — | Opening unapproved serial port /dev/ttyUSB99 blocked at HostSPI boundary (busCalls=0). |
| **Step Limiter DoS Protection** | 🛡️ PASS (Блокировано) | **busCalls: 0** | `TDS_E106` | 🚨 Вызван | Execution terminated strictly at 100,001 steps in 25ms, triggering host.emergencyStop() with zero CPU hang. |
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
- **Позитивные тесты (Positive)**: **47** (78,3%)
- **Негативные тесты (Negative, отказ невалидного кода)**: **13** (21,7%)
- **Разбивка по компонентам**: Lexer (13), Parser (6), Runtime (32), Security (7), Diagnostics (2)
- **Формальная грамматика GBNF (`grammar.gbnf`)**: ✅ ВЕРИФИЦИРОВАНА

