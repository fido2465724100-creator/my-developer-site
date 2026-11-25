# TDscript Global LLM Benchmark — Тест №5 (AI-First Validation)

Objective benchmark comparing **7 target languages/runtimes** across 10 identical hardware and network orchestration tasks.

## Summary Comparison Table

| Target | Status | First-Pass % | Final Success % | Avg Repair Iters | Cost / Success | Total Prompt Tokens | Total Completion Tokens | Avg LOC |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **TDscript Base (v1.4.0)** | `COMPLETED` | 40.0% | 60.0% | 0.33 | 9698.5 | 7672 | 50519 | 4.3 |
| **TDscript Experimental (AI-First)** | `COMPLETED` | 40.0% | 60.0% | 0.50 | 8321.0 | 9303 | 40623 | 3.7 |
| **Python** | `COMPLETED` | 60.0% | 90.0% | 0.33 | 3176.8 | 5011 | 23580 | 10.7 |
| **C++ (Arduino/ESP32 style)** | `COMPLETED` | 30.0% | 80.0% | 1.00 | 7910.1 | 8220 | 55061 | 9.3 |
| **Lua** | `COMPLETED` | 40.0% | 90.0% | 0.67 | 4799.0 | 7443 | 35748 | 9.7 |
| **JavaScript (Node.js)** | `COMPLETED` | 40.0% | 80.0% | 0.63 | 5831.5 | 6831 | 39821 | 8.0 |
| **Kotlin** | `COMPLETED` | 30.0% | 70.0% | 0.71 | 7559.0 | 7296 | 45617 | 12.1 |

---

## Failure Breakdown

| Target | TRUNCATED_IN_THINKING | COMPILE_OR_SYNTAX_ERROR | RUNTIME_OR_SCOPE_ERROR | OUTPUT_MISMATCH | Total Failures |
|:---|:---:|:---:|:---:|:---:|:---:|
| **TDscript Base (v1.4.0)** | 8 | 1 | 2 | 3 | 14 |
| **TDscript Experimental (AI-First)** | 7 | 2 | 0 | 6 | 15 |
| **Python** | 1 | 0 | 2 | 3 | 6 |
| **C++ (Arduino/ESP32 style)** | 10 | 0 | 0 | 4 | 14 |
| **Lua** | 3 | 0 | 1 | 5 | 9 |
| **JavaScript (Node.js)** | 6 | 0 | 0 | 5 | 11 |
| **Kotlin** | 8 | 3 | 0 | 3 | 14 |

---

## Task Details & Verification Criteria

### Task 1: BME280 Chip ID Read
- **Description**: Read Bosch BME280 Chip ID via I2C (address 0x76, register 0xD0, length 1 byte) and print the result.
- **Verification**: Checks for [96, 0x60]

### Task 2: Modbus Boiler Temperature Control
- **Description**: Read boiler temperature from Modbus register 100 ('127.0.0.1') and pump status from register 101. If temperature > 250, write pump status 0 (OFF).
- **Verification**: Checks for [245, 100, 101]

### Task 3: Safe I2C Poll with Watchdog Emergency
- **Description**: Safely read I2C sensor at address 0x76 (register 0xD0, 1 byte). If read returns error or null, call WATCHDOG.emergencyStop(), otherwise print 'POLL_OK'.
- **Verification**: Checks for [POLL_OK, 0x76]

### Task 4: Modbus 5-Iteration Loop with Watchdog Feed
- **Description**: Execute a loop for 5 iterations: in each iteration read Modbus register 100 and call WATCHDOG.feed().
- **Verification**: Checks for [feed, 100]

### Task 5: Localized Notification Resource
- **Description**: Create and print a localized notification with key ALERT_TEMP and parameter temp=24.5 (in TDscript use LString without direct string concatenation).
- **Verification**: Checks for [ALERT_TEMP, 24.5]

### Task 6: BLE Sensor Connect & Query
- **Description**: Connect to BLE device 'sensor_01', send 'READ' command, and print the response string.
- **Verification**: Checks for [BT_OK, 24.5C, sensor_01]

### Task 7: Network Ping Check and Modbus Read
- **Description**: Ping host '192.168.1.50'. If ping is successful (> 0), read Modbus register 100 and print it.
- **Verification**: Checks for [192.168.1.50, 245]

### Task 8: I2C Configuration Register Write
- **Description**: Write configuration byte to register 0xF4 of I2C sensor 0x76 and print write status.
- **Verification**: Checks for [0x76, 0xF4, true]

### Task 9: Combined Dual-Sensor Verification
- **Description**: Read BME280 Chip ID (0x76) and Modbus register 100. If both are valid, print 'SYSTEM_OK', otherwise call WATCHDOG.emergencyStop().
- **Verification**: Checks for [SYSTEM_OK]

### Task 10: Strict CapabilityScope Adherence & Self-Repair
- **Description**: Operate strictly within granted CapabilityScope (I2C allowed only on 0x76, Modbus registers 100..200). If forbidden address (e.g. 0x68) is attempted, catch or self-repair to 0x76.
- **Verification**: Checks for [0x76]

