# TDscript Global LLM Benchmark — Тест №4 (Test #4)

Objective benchmark comparing **7 target languages/runtimes** across 10 identical hardware and network orchestration tasks.

## Summary Comparison Table

| Target | Status | First-Pass % | Final Success % | Avg Repair Iters | Cost / Success | Total Prompt Tokens | Total Completion Tokens | Avg LOC |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **TDscript Base (v1.4.0)** | `COMPLETED` | 0.0% | 20.0% | 1.50 | 18021.0 | 11486 | 24556 | 4.5 |
| **TDscript Experimental (AI-First)** | `COMPLETED` | 10.0% | 20.0% | 1.00 | 18785.0 | 12049 | 25521 | 3.5 |
| **Python** | `COMPLETED` | 0.0% | 40.0% | 1.50 | 8298.5 | 8950 | 24244 | 8.5 |
| **C++ (Arduino/ESP32 style)** | `COMPLETED` | 0.0% | 10.0% | 2.00 | 37666.0 | 10072 | 27594 | 11.0 |
| **Lua** | `COMPLETED` | 10.0% | 40.0% | 1.25 | 7675.0 | 7890 | 22810 | 4.3 |
| **JavaScript (Node.js)** | `COMPLETED` | 10.0% | 30.0% | 1.33 | 10895.7 | 9316 | 23371 | 12.7 |
| **Kotlin** | `COMPLETED` | 0.0% | 10.0% | 1.00 | 34869.0 | 9719 | 25150 | 9.0 |

---

## Failure Breakdown

| Target | TRUNCATED_IN_THINKING | COMPILE_OR_SYNTAX_ERROR | RUNTIME_OR_SCOPE_ERROR | OUTPUT_MISMATCH | Total Failures |
|:---|:---:|:---:|:---:|:---:|:---:|
| **TDscript Base (v1.4.0)** | 24 | 1 | 1 | 1 | 27 |
| **TDscript Experimental (AI-First)** | 25 | 0 | 1 | 0 | 26 |
| **Python** | 21 | 2 | 0 | 1 | 24 |
| **C++ (Arduino/ESP32 style)** | 28 | 1 | 0 | 0 | 29 |
| **Lua** | 18 | 0 | 2 | 3 | 23 |
| **JavaScript (Node.js)** | 19 | 2 | 2 | 2 | 25 |
| **Kotlin** | 22 | 5 | 0 | 1 | 28 |

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

