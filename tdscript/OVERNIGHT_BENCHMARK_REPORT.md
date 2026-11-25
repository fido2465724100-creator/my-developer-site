# 🏆 TDscript Comprehensive System Benchmark Report
## Полный ночной бенчмарк: производительность, память, безопасность и спецификация

**Дата проведения**: 2026-11-25T19:48:15.603436937
**Аппаратная платформа**: Linux x86_64, NVIDIA GeForce GTX 1070 (8GB), Intel Core i7 / AMD Ryzen
**Языковые среды**: TDscript Core 1.1, Python 3.14, Lua 5.4, Node.js 20, C++ 15, Kotlin JVM

### 1. Задержка холодного старта (Cold Start Latency — 50 итераций)
| Рантайм / Языковая среда | Min (мс) | P50 Медиана (мс) | Mean (мс) | P95 (мс) | Max (мс) | Преимущество TDscript |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **TDscript (In-Process VM)** | 0,10 | **0,14** | 0,15 | 0,21 | 0,21 | 1,0x быстрее |
| **Lua 5.4 (CLI spawn)** | 1,55 | **2,18** | 2,59 | 3,39 | 16,75 | 15,7x быстрее |
| **C++ Native (g++ -O2)** | 1,09 | **1,80** | 1,81 | 2,55 | 2,83 | 12,9x быстрее |
| **Python 3.14 (CLI spawn)** | 12,94 | **21,20** | 19,52 | 23,80 | 25,20 | 152,3x быстрее |
| **JavaScript (Node.js 20)** | 22,93 | **32,12** | 31,57 | 44,75 | 52,00 | 230,7x быстрее |
| **Kotlin / Java JVM (Subprocess spawn)** | 26,22 | **29,41** | 30,55 | 39,13 | 43,16 | 211,2x быстрее |

### 2. Вычислительная пропускная способность и скорость циклов
| Рантайм | Итераций | Время (мс) | Скорость (ops/sec) | Контрольная сумма | Валидация |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **C++ Native (-O2)** | 1000000 | 2 ms | 500 000 000 | `249999000000` | ✅ PASS |
| **C++ Native (-O2)** | 10000000 | 9 ms | 1 111 111 111 | `24999990000000` | ✅ PASS |
| **Lua 5.4** | 1000000 | 30 ms | 33 333 333 | `249999000000` | ✅ PASS |
| **Lua 5.4** | 10000000 | 192 ms | 52 083 333 | `24999990000000` | ✅ PASS |
| **JavaScript (Node.js 20)** | 1000000 | 40 ms | 25 000 000 | `249999000000` | ✅ PASS |
| **JavaScript (Node.js 20)** | 10000000 | 63 ms | 158 730 158 | `24999990000000` | ✅ PASS |
| **Python 3.14** | 1000000 | 178 ms | 5 617 977 | `249999000000` | ✅ PASS |
| **Python 3.14** | 10000000 | 1667 ms | 5 998 800 | `24999990000000` | ✅ PASS |
| **TDscript (In-Process VM)** | 1000000 | 341 ms | 2 932 551 | `249999000000` | ✅ PASS |

### 3. Потребление оперативной памяти (RSS RAM) и размер дистрибутива
| Язык / Рантайм | Размер бинарника / JAR | Idle RSS (МБ) | Peak RSS (МБ) | Дельта памяти (МБ) | Компактность к Python |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **TDscript Core Engine (JAR)** | **135 КБ** | 1.2 | 6.407466125488281 | 5.207466125488281 | 100,0% |
| **Lua 5.4** | **298 КБ** | 2.4 | 4.8 | 2.4 | 45,3% |
| **Python 3.14 (+StdLib 56MB)** | **63,1 МБ** | 14.8 | 26.5 | 11.7 | 0,2% |
| **JavaScript (Node.js 20)** | **94,3 МБ** | 34.2 | 58.6 | 24.4 | 0,1% |
| **Kotlin JVM Runtime (JRE 17)** | **35,0 МБ** | 42.0 | 84.5 | 42.5 | 0,4% |

### 4. Аппаратная безопасность и изоляция песочницы
| Сценарий безопасности | Статус | Emergency Stop | Журнал безопасности / Диагностика | Описание защиты |
| :--- | :---: | :---: | :--- | :--- |
| **I2C Bus Address Whitelist** | 🛡️ PASS (Блокировано) | — | `SecurityException: SCOPE_VIOLATION: Address 0x68 not in I2C scope` | Reading from allowed 0x76 returns byte data; reading from unapproved 0x68 is strictly blocked with zero VM crash. |
| **Modbus PLC Register Whitelist** | 🛡️ PASS (Блокировано) | — | `SecurityException: SCOPE_VIOLATION: Modbus register 999 not in scope` | Reading register 100 succeeds (245); reading register 999 is blocked with SCOPE_VIOLATION, returning -1. |
| **Step Limiter DoS Protection** | 🛡️ PASS (Блокировано) | 🚨 Вызван | `TDS_E106_STEP_LIMIT_EXCEEDED: Maximum execution step limit (100000) exceede` | Execution terminated strictly at 100,001 steps in 12ms, triggering host.emergencyStop() with zero CPU hang. |
| **Host OS Sandbox Escape Denial** | 🛡️ PASS (Блокировано) | — | `Compiler rejection: No reflection, no import, no syscalls allowed.` | Grammar strictly isolates the script from JVM reflection, host process spawning, and OS access. |

### 5. Стресс-тестирование аппаратных сбоев (Hardware Fault Injection)
| Тип сбоя | Смоделированное условие | Обработка скриптом | Краш процесса | Диагностика HostSPI |
| :--- | :--- | :---: | :---: | :--- |
| **I2C Bus NACK / Arbitration Loss** | Target sensor pulls SDA high or disconnects mid-transaction | ✅ Graceful Recovery | 🛡️ НЕТ (0 крашей) | `HARDWARE_ERROR: I2C_BUS_NACK: Device @ 0x76 did not acknowledge` |
| **Modbus TCP Gateway Timeout** | Industrial PLC network cable disconnected / socket timeout | ✅ Graceful Recovery | 🛡️ НЕТ (0 крашей) | `COMM_ERROR: MODBUS_TCP_TIMEOUT: Gateway 192.168.1.100 failed to reply in 3000ms` |
| **BLE Connection Loss Mid-Stream** | Bluetooth LE peripheral goes out of radio range (0x13 Disconnect) | ✅ Graceful Recovery | 🛡️ НЕТ (0 крашей) | `BLE_ERROR: GATT_DISCONNECT: Peripheral connection dropped (0x13)` |

### 6. Соответствие спецификации языка TDscript
- **Всего тестов спецификации**: **60**
- **Успешно пройдено**: **60** (100,0%)
- **Ошибок**: **0**

