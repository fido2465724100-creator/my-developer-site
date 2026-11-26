# TDscript Global LLM Benchmark — Тест №7 (v1.5.0 AI Token Optimization & Semantic Domains)

Objective benchmark comparing **TDscript AI-First (v1.5.0)** across 10 hardware and network orchestration tasks, grouped into 4 semantic domains on local LLM (`Qwen3.5-4B-Unloop-Q4_K_M.gguf`).

## Summary Comparison Table (Test 7 vs Test 5)

| Target / Metric | Status | First-Pass % | Final Success % | Avg Repair Iters | Cost / Success | Total Prompt Tokens | Total Completion Tokens | Avg LOC |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **TDscript AI-First (v1.5.0)** *(Test 7)* | `COMPLETED` | **70.0%** | **70.0%** | **0.00** | 5443.3 | 8345 | 29758 | **5.3** |
| TDscript Experimental (AI-First) *(Test 5)* | `COMPLETED` | 40.0% | 60.0% | 0.50 | 8321.0 | 9303 | 40623 | 3.7 |
| TDscript Base (v1.4.0) *(Test 5)* | `COMPLETED` | 40.0% | 60.0% | 0.33 | 9698.5 | 7672 | 50519 | 4.3 |
| Python *(Test 5 baseline)* | `COMPLETED` | 60.0% | 90.0% | 0.33 | 3176.8 | 5011 | 23580 | 10.7 |

---

## Failure Breakdown

| Target | TRUNCATED_IN_THINKING | COMPILE_OR_SYNTAX_ERROR | RUNTIME_OR_SCOPE_ERROR | OUTPUT_MISMATCH | Total Failures |
|:---|:---:|:---:|:---:|:---:|:---:|
| **TDscript AI-First (v1.5.0)** | 7 | 0 | 0 | 2 | 9 |

> **Key Observation**: **0 Syntax / Compiler Errors** (down from 2 in Test 5). All failures were either output format expectations (missing `print` in Task 4) or local LLM reasoning limits (Tasks 9 & 10 hit the 4096 thinking token ceiling of Qwen3.5-4B).

---

## Performance by Domain Category

### 1. Sensors & Hardware Buses (I2C/SPI) (3 tasks: #1, #3, #8)

| Target | First-Pass % | Final Success % | Avg LOC |
|:---|:---:|:---:|:---:|
| **TDscript AI-First (v1.5.0)** | **100.0%** | **100.0%** | **4.3** |

### 2. Industrial Automation & Fieldbuses (Modbus/Ethernet) (3 tasks: #2, #4, #7)

| Target | First-Pass % | Final Success % | Avg LOC |
|:---|:---:|:---:|:---:|
| **TDscript AI-First (v1.5.0)** | **66.7%** | **66.7%** | **7.5** |

### 3. Wireless Peripherals & Interfaces (BLE/LString) (2 tasks: #5, #6)

| Target | First-Pass % | Final Success % | Avg LOC |
|:---|:---:|:---:|:---:|
| **TDscript AI-First (v1.5.0)** | **100.0%** | **100.0%** | **4.5** |

### 4. Composite Logic & Safety Sandboxing (Multi-Sensor/ACL) (2 tasks: #9, #10)

| Target | First-Pass % | Final Success % | Avg LOC |
|:---|:---:|:---:|:---:|
| **TDscript AI-First (v1.5.0)** | **0.0%** | **0.0%** | **0.0** |

---

## Task Details & Verification Criteria (by Domain Category)

### 1. Sensors & Hardware Buses (I2C/SPI)

#### Task 1: BME280 Chip ID Read
- **Category**: 1. Sensors & Hardware Buses (I2C/SPI)
- **Description**: Read Bosch BME280 Chip ID via I2C (address 0x76, register 0xD0, length 1 byte) and print the result.
- **Verification**: Checks for `[96, 0x60]`
- **Benchmark Result**: ✅ PASS (1 attempt(s), 12.6s)
```tdscript
language: ai;
id = I2C.read(0x76, 0xD0, 1);
print(id);
```

#### Task 3: Safe I2C Poll with Watchdog Emergency
- **Category**: 1. Sensors & Hardware Buses (I2C/SPI)
- **Description**: Safely read I2C sensor at address 0x76 (register 0xD0, 1 byte). If read returns error or null, call WATCHDOG.emergencyStop(), otherwise print 'POLL_OK'.
- **Verification**: Checks for `[POLL_OK, 0x76]`
- **Benchmark Result**: ✅ PASS (1 attempt(s), 66.2s)
```tdscript
language: ai;
data = I2C.read(0x76, 0xD0, 1);
if (data == null) {
    WATCHDOG.emergencyStop();
} else {
    print("POLL_OK");
}
```

#### Task 8: I2C Configuration Register Write
- **Category**: 1. Sensors & Hardware Buses (I2C/SPI)
- **Description**: Write configuration byte to register 0xF4 of I2C sensor 0x76 and print write status.
- **Verification**: Checks for `[0x76, 0xF4, true]`
- **Benchmark Result**: ✅ PASS (1 attempt(s), 44.7s)
```tdscript
language: ai;
status = I2C.write(0x76, 0xF4, 1);
print("Write Status: ", status);
```

### 2. Industrial Automation & Fieldbuses (Modbus/Ethernet)

#### Task 2: Modbus Boiler Temperature Control
- **Category**: 2. Industrial Automation & Fieldbuses (Modbus/Ethernet)
- **Description**: Read boiler temperature from Modbus register 100 ('127.0.0.1') and pump status from register 101. If temperature > 250, write pump status 0 (OFF).
- **Verification**: Checks for `[245, 100, 101]`
- **Benchmark Result**: ✅ PASS (1 attempt(s), 53.3s)
```tdscript
language: ai;
temp = PLC.modbusRead("127.0.0.1", 100);
pumpStatus = PLC.modbusRead("127.0.0.1", 101);
if (temp > 250) {
    PLC.modbusWrite("127.0.0.1", 101, 0);
    print("ALERT: Temp ", temp);
} else {
    print("OK: Temp ", temp);
}
```

#### Task 4: Modbus 5-Iteration Loop with Watchdog Feed
- **Category**: 2. Industrial Automation & Fieldbuses (Modbus/Ethernet)
- **Description**: Execute a loop for 5 iterations: in each iteration read Modbus register 100 and call WATCHDOG.feed().
- **Verification**: Checks for `[feed, 100]`
- **Benchmark Result**: ⚠️ OUTPUT_MISMATCH (3 attempt(s), 125.1s)
```tdscript
language: ai;
count = 0;
while (count < 5) {
    PLC.modbusRead("127.0.0.1", 100);
    WATCHDOG.feed();
    count += 1;
}
```

#### Task 7: Network Ping Check and Modbus Read
- **Category**: 2. Industrial Automation & Fieldbuses (Modbus/Ethernet)
- **Description**: Ping host '192.168.1.50'. If ping is successful (> 0), read Modbus register 100 and print it.
- **Verification**: Checks for `[192.168.1.50, 245]`
- **Benchmark Result**: ✅ PASS (1 attempt(s), 25.4s)
```tdscript
language: ai;
pingResult = NET.ping("192.168.1.50");
if (pingResult > 0) {
    modbusVal = PLC.modbusRead("127.0.0.1", 100);
    print(modbusVal);
}
```

### 3. Wireless Peripherals & Interfaces (BLE/LString)

#### Task 5: Localized Notification Resource
- **Category**: 3. Wireless Peripherals & Interfaces (BLE/LString)
- **Description**: Create and print a localized notification with key ALERT_TEMP and parameter temp=24.5 (in TDscript use LString without direct string concatenation).
- **Verification**: Checks for `[ALERT_TEMP, 24.5]`
- **Benchmark Result**: ✅ PASS (1 attempt(s), 20.6s)
```tdscript
language: ai;
temp = 24.5;
msg = L"ALERT_TEMP:Temperature is {temp}";
print(msg);
```

#### Task 6: BLE Sensor Connect & Query
- **Category**: 3. Wireless Peripherals & Interfaces (BLE/LString)
- **Description**: Connect to BLE device 'sensor_01', send 'READ' command, and print the response string.
- **Verification**: Checks for `[BT_OK, 24.5C, sensor_01]`
- **Benchmark Result**: ✅ PASS (1 attempt(s), 19.1s)
```tdscript
language: ai;
conn = BLE.connect("sensor_01");
BLE.send("READ");
response = BLE.readLine();
print(response);
```

### 4. Composite Logic & Safety Sandboxing (Multi-Sensor/ACL)

#### Task 9: Combined Dual-Sensor Verification
- **Category**: 4. Composite Logic & Safety Sandboxing (Multi-Sensor/ACL)
- **Description**: Read BME280 Chip ID (0x76) and Modbus register 100. If both are valid, print 'SYSTEM_OK', otherwise call WATCHDOG.emergencyStop().
- **Verification**: Checks for `[SYSTEM_OK]`
- **Benchmark Result**: ⚠️ TRUNCATED_IN_THINKING (3 attempt(s), 277.0s)

#### Task 10: Strict CapabilityScope Adherence & Self-Repair
- **Category**: 4. Composite Logic & Safety Sandboxing (Multi-Sensor/ACL)
- **Description**: Operate strictly within granted CapabilityScope (I2C allowed only on 0x76, Modbus registers 100..200). If forbidden address (e.g. 0x68) is attempted, catch or self-repair to 0x76.
- **Verification**: Checks for `[0x76]`
- **Benchmark Result**: ⚠️ TRUNCATED_IN_THINKING (3 attempt(s), 275.7s)

