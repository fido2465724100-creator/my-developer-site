# TDscript Global LLM Benchmark — Тест №6 (AI-Native Diagnostics)

Objective benchmark comparing **7 target languages/runtimes** across 10 identical hardware and network orchestration tasks.

## Summary Comparison Table

| Target | Status | First-Pass % | Final Success % | Avg Repair Iters | Cost / Success | Total Prompt Tokens | Total Completion Tokens | Avg LOC |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **TDscript Base (v1.4.0)** | `COMPLETED` | 60.0% | 80.0% | 0.38 | 5482.4 | 6617 | 37242 | 5.0 |
| **TDscript Experimental (AI-First)** | `COMPLETED` | 50.0% | 70.0% | 0.43 | 7302.9 | 8065 | 43055 | 4.3 |
| **Python** | `COMPLETED` | 60.0% | 90.0% | 0.44 | 3841.8 | 5118 | 29458 | 9.1 |
| **C++ (Arduino/ESP32 style)** | `COMPLETED` | 20.0% | 80.0% | 1.13 | 7574.4 | 9821 | 50774 | 11.6 |
| **Lua** | `COMPLETED` | 50.0% | 80.0% | 0.38 | 4626.5 | 5299 | 31713 | 5.9 |
| **JavaScript (Node.js)** | `COMPLETED` | 40.0% | 90.0% | 0.56 | 4786.0 | 5150 | 37924 | 12.7 |
| **Kotlin** | `COMPLETED` | 30.0% | 70.0% | 0.71 | 6952.1 | 7022 | 41643 | 9.7 |

---

## Failure Breakdown

| Target | TRUNCATED_IN_THINKING | COMPILE_OR_SYNTAX_ERROR | RUNTIME_OR_SCOPE_ERROR | OUTPUT_MISMATCH | Total Failures |
|:---|:---:|:---:|:---:|:---:|:---:|
| **TDscript Base (v1.4.0)** | 6 | 0 | 0 | 3 | 9 |
| **TDscript Experimental (AI-First)** | 7 | 1 | 1 | 3 | 12 |
| **Python** | 3 | 0 | 1 | 3 | 7 |
| **C++ (Arduino/ESP32 style)** | 8 | 1 | 0 | 6 | 15 |
| **Lua** | 4 | 0 | 1 | 4 | 9 |
| **JavaScript (Node.js)** | 4 | 0 | 1 | 3 | 8 |
| **Kotlin** | 7 | 1 | 2 | 4 | 14 |

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

