# F.I.R.S.T 测试质量判据

本文档定义**测试代码本身的质量标准**，适用于为下游应用项目编写的单元测试、集成测试和端到端测试。它不适用于应用代码质量评估。

## 与其他协议的关系

- **本文档（test-quality-first.md）**：测试代码的质量标准——测试写得好不好
- **validation-execution.md**：任务级验证执行协议——如何选择和运行验证入口、记录结果
- **task-record-template.md**：任务记录模板——如何记录整个任务的证据

简单来说：validation-execution 告诉你"跑哪些测试"，本文档告诉你"测试本身是否合格"。

---

## F.I.R.S.T 五项判据

F.I.R.S.T 是 Robert C. Martin（Uncle Bob）在《Clean Code》中提出的测试质量原则，确保测试可靠、可维护、可快速反馈。

### F - Fast（快速）

**定义**：测试必须快速运行，使开发者能频繁执行而不打断思维流。

**具体阈值**：
- **单元测试**：单个测试 < 100ms，完整套件 < 5s
- **集成测试**：单个测试 < 2s，完整套件 < 30s
- **端到端测试**：单个测试 < 10s，完整套件 < 5min

**反模式示例（Node.js）**：

```javascript
// ❌ 反模式：测试中加入真实的延迟
test('user session expires after timeout', async () => {
  const session = createSession();
  await sleep(60000); // 等待 60 秒！
  expect(session.isExpired()).toBe(true);
});

// ✅ 正确：使用时钟 mock
test('user session expires after timeout', () => {
  const session = createSession();
  jest.advanceTimersByTime(60000);
  expect(session.isExpired()).toBe(true);
});
```

**反模式示例（Python）**：

```python
# ❌ 反模式：每个测试都重建数据库
def test_user_can_login():
    drop_and_recreate_database()  # 太慢！
    user = create_user("test@example.com")
    assert user.can_login()

# ✅ 正确：使用事务回滚或 in-memory database
@pytest.fixture(autouse=True)
def transaction_rollback(db_session):
    yield
    db_session.rollback()

def test_user_can_login(db_session):
    user = create_user("test@example.com")
    assert user.can_login()
```

**何时可放宽**：集成测试和端到端测试允许更长运行时间，但仍应优化以避免成为瓶颈。

---

### I - Independent（独立）

**定义**：测试之间不应有依赖关系或共享状态。任何测试都能单独运行或以任意顺序运行，结果保持一致。

**具体标准**：
- 测试 A 的失败不应导致测试 B 失败
- 测试执行顺序改变不应影响结果
- 可以单独运行单个测试文件或测试用例

**反模式示例（TypeScript）**：

```typescript
// ❌ 反模式：测试共享全局状态
let userId: string;

test('create user', () => {
  userId = createUser({ name: 'Alice' });
  expect(userId).toBeDefined();
});

test('update user', () => {
  updateUser(userId, { name: 'Bob' }); // 依赖上一个测试！
  expect(getUser(userId).name).toBe('Bob');
});

// ✅ 正确：每个测试独立准备数据
test('create user', () => {
  const userId = createUser({ name: 'Alice' });
  expect(userId).toBeDefined();
});

test('update user', () => {
  const userId = createUser({ name: 'Alice' }); // 自己创建
  updateUser(userId, { name: 'Bob' });
  expect(getUser(userId).name).toBe('Bob');
});
```

**反模式示例（Python）**：

```python
# ❌ 反模式：测试依赖文件系统状态
def test_create_config_file():
    create_config("config.json", {"debug": True})
    assert os.path.exists("config.json")

def test_read_config_file():
    config = read_config("config.json")  # 依赖上一个测试！
    assert config["debug"] is True

# ✅ 正确：使用 fixture 隔离
@pytest.fixture
def config_file(tmp_path):
    config_path = tmp_path / "config.json"
    create_config(str(config_path), {"debug": True})
    return config_path

def test_read_config_file(config_file):
    config = read_config(str(config_file))
    assert config["debug"] is True
```

**何时可放宽**：某些集成测试可能共享数据库 fixture，但仍应确保测试间无顺序依赖。

---

### R - Repeatable（可重复）

**定义**：测试在任何环境下重复运行应产生相同结果，不依赖外部不可控因素。

**具体标准**：
- 不依赖当前时间、随机数、网络、外部 API
- 不依赖特定机器的配置（端口、路径、环境变量）
- 不依赖测试运行的时区或语言环境

**反模式示例（Node.js）**：

```javascript
// ❌ 反模式：依赖当前时间
test('user birthday is today', () => {
  const user = { birthDate: new Date('1990-01-20') };
  const today = new Date();
  expect(user.birthDate.getDate()).toBe(today.getDate()); // 只在 1 月 20 日通过！
});

// ✅ 正确：注入可控的时间
test('user birthday is today', () => {
  const mockToday = new Date('2026-01-20');
  const user = { birthDate: new Date('1990-01-20') };
  expect(isBirthday(user, mockToday)).toBe(true);
});
```

**反模式示例（TypeScript）**：

```typescript
// ❌ 反模式：依赖随机数
test('generates unique ID', () => {
  const id1 = generateId(); // 内部用 Math.random()
  const id2 = generateId();
  expect(id1).not.toBe(id2); // 可能偶尔失败！
});

// ✅ 正确：mock 随机数生成器
test('generates unique ID', () => {
  jest.spyOn(Math, 'random')
    .mockReturnValueOnce(0.1)
    .mockReturnValueOnce(0.2);
  const id1 = generateId();
  const id2 = generateId();
  expect(id1).not.toBe(id2);
});
```

**何时可放宽**：端到端测试可能依赖外部服务，但应使用 staging 环境或 mock server 而非生产环境。

---

### S - Self-Validating（自验证）

**定义**：测试必须自动判断通过或失败，不需要人工检查输出、日志或文件。

**具体标准**：
- 测试以 `PASS` 或 `FAIL` 结束，无需人工解释
- 不依赖 `console.log` 输出判断结果
- 不依赖人工对比生成的文件或截图

**反模式示例（Python）**：

```python
# ❌ 反模式：需要人工检查日志
def test_calculation():
    result = calculate(10, 20)
    print(f"Result: {result}")  # 需要人工看日志判断是否正确

# ✅ 正确：自动断言
def test_calculation():
    result = calculate(10, 20)
    assert result == 30
```

**反模式示例（Node.js）**：

```javascript
// ❌ 反模式：生成文件但不验证内容
test('generates report', () => {
  generateReport('output.pdf');
  expect(fs.existsSync('output.pdf')).toBe(true); // 文件存在，但内容对吗？
});

// ✅ 正确：验证关键内容
test('generates report with correct data', () => {
  generateReport('output.pdf');
  const content = parsePDF('output.pdf');
  expect(content).toContain('Total Sales: $1000');
  expect(content).toContain('Date: 2026-01-20');
});
```

**何时可放宽**：视觉回归测试（screenshot testing）可能需要人工确认首次基准，但后续应自动对比。

---

### T - Timely（及时）

**定义**：测试应与实现代码同步编写，理想情况下采用 TDD（测试驱动开发）在实现前编写。

**具体标准**：
- 新功能必须有对应测试
- Bug 修复前先写失败的测试，修复后测试通过
- 不应在功能完成数周后才"补测试"

**反模式示例（概念）**：

```
❌ 反模式工作流：
Week 1: 实现用户注册功能
Week 2: 实现登录功能
Week 3: 实现密码重置
Week 4: "现在开始写测试吧"（太晚了！代码已固化，测试变成事后文档）

✅ 正确工作流（TDD）：
Day 1:
  1. 写失败的注册测试
  2. 实现最小代码使测试通过
  3. 重构
Day 2:
  1. 写失败的登录测试
  2. 实现最小代码使测试通过
  3. 重构
```

**实践建议**：
- 对于 Bug：修复前先写 **回归测试**（证明 bug 存在），修复后测试应通过
- 对于新功能：采用 **RED-GREEN-REFACTOR** 循环（详见 `realize-tdd` 技能）
- 对于遗留代码：重构前先写 **characterization test**（描述当前行为），确保重构不改变行为

**何时可放宽**：原型阶段或探索性编程可以延后测试，但在功能稳定后必须补齐。

---

## 适用范围与例外

### 必须全部满足 F.I.R.S.T 的场景

- **单元测试**：测试单个函数、类或模块，必须满足所有 5 项判据
- **关键业务逻辑测试**：涉及金额计算、权限判断、数据一致性的测试

### 可适当放宽的场景

| 测试类型 | 可放宽的判据 | 理由 |
|---------|-------------|------|
| 集成测试 | Fast（可到 2s）、Independent（可共享 DB fixture） | 涉及多个组件，天然较慢 |
| 端到端测试 | Fast（可到 10s）、Repeatable（可依赖 staging 环境） | 涉及完整系统栈 |
| 性能测试 | Fast（故意测量耗时） | 测试目标就是性能 |
| 视觉回归测试 | Self-Validating（首次需人工确认基准） | 视觉差异难以完全自动化 |

### 不适用 F.I.R.S.T 的内容

- **应用代码质量**：用其他标准（如 Clean Code、SOLID）
- **手动探索性测试**：非自动化测试
- **生产监控告警**：不是开发阶段的测试

---

## 如何应用 F.I.R.S.T

### 在 Code Review 中

审查测试代码时，逐项检查：

- [ ] **Fast**：这个测试运行时间合理吗？有没有不必要的 sleep 或真实 I/O？
- [ ] **Independent**：这个测试能单独运行吗？有没有依赖其他测试的执行顺序？
- [ ] **Repeatable**：这个测试在任何机器上都能通过吗？有没有依赖当前时间或随机数？
- [ ] **Self-Validating**：这个测试有明确的断言吗？还是需要人工查看日志？
- [ ] **Timely**：这个测试是和功能同步编写的吗？还是事后补充的？

### 在 TDD 流程中

当使用 `realize-tdd` 技能实现功能时：

1. **RED**：写失败的测试（确保 Self-Validating）
2. **GREEN**：写最小实现使测试通过
3. **REFACTOR**：重构时确保测试仍满足 Fast、Independent、Repeatable

### 在遗留代码中

为遗留代码补充测试时：

1. 优先为高风险代码补充测试（Timely 的变体：风险驱动）
2. 确保新测试满足 F.I.R.S.T，即使旧代码不满足
3. 逐步重构使旧代码更可测试

---

## 自检清单

在将测试代码提交审查前确认：

- [ ] 每个测试文件的测试套件运行时间在合理范围内（单元测试 < 5s）
- [ ] 可以单独运行任意一个测试文件或测试用例
- [ ] 测试不依赖执行顺序，可以随机打乱顺序运行
- [ ] 测试不依赖当前时间、随机数、外部网络（或已 mock）
- [ ] 每个测试有明确的断言，不依赖日志或人工检查
- [ ] 测试与功能代码同步提交，不是事后补充

---

## 参考资料

- Robert C. Martin, *Clean Code: A Handbook of Agile Software Craftsmanship*, Chapter 9: Unit Tests
- bigpowers `enforce-first` 技能（`tmp/bigpowers/skills/enforce-first/SKILL.md`）
- Martin Fowler, [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
