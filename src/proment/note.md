### 📋 JSON Schema 类型 ↔ Python 类型对照表

| JSON Schema 类型 | Python 类型 | 说明 |
|------------------|-------------|------|
| `"string"`       | `str`       | 文本字符串。JSON 中的字符串始终映射为 Python 的 `str`。 |
| `"number"`       | `float`     | JSON 中的数字（无论整数还是浮点数）在 Python 中默认解析为 `float`，除非特别处理。 |
| `"integer"`      | `int`       | JSON 中不含小数部分的数字。使用 `json.loads` 时，如果数字没有小数点，默认解析为 `int`。 |
| `"boolean"`      | `bool`      | JSON 中的 `true`/`false` 对应 Python 的 `True`/`False`。 |
| `"array"`        | `list`      | JSON 数组对应 Python 列表，元素类型按上述规则递归。 |
| `"object"`       | `dict`      | JSON 对象对应 Python 字典，键为字符串，值为对应 Python 类型。 |
| `"null"`         | `None`      | JSON 的 `null` 值对应 Python 的 `None`。 |

---


### ⚠️ 注意事项

1. **`number` vs `integer`**  
   - JSON Schema 中的 `"integer"` 明确要求值为整数。但在 JSON 传输中，整数通常不带小数点，`json.loads` 会自动将其解析为 `int`。  
   - `"number"` 可以接受整数和浮点数，解析后可能为 `int` 或 `float`。如果需要确保类型一致性，可在代码中做转换（例如强制 `float`）。

2. **数组（`array`）**  
   - 可通过 `items` 关键字指定元素类型。解析后是一个 Python `list`，内部元素类型由实际数据决定。

3. **对象（`object`）**  
   - 可通过 `properties` 定义每个字段的类型。解析后是一个 Python `dict`。
   - 若启用 `"strict": true`（OpenAI 的严格模式），则要求所有参数都在 `required` 中列出，且不能有多余字段，确保输出严格符合 Schema。

4. **枚举（`enum`）**  
   - JSON Schema 中的 `enum` 是一个数组，指定字段允许的值。在 Python 中，解析后值会是枚举列表中的某个成员（类型取决于枚举值的类型）。例如 `enum: ["celsius", "fahrenheit"]` 解析后为字符串。

5. **复合类型（`anyOf`/`oneOf`）**  
   - 当 Schema 使用 `anyOf` 或 `oneOf` 时，模型输出的值可能对应其中一种类型。你需要根据实际数据动态判断类型。例如一个字段可能是 `string` 或 `number`，解析后可能是 `str` 或 `int`/`float`。

6. **`null` 值**  
   - 如果参数允许为 `null`（在 Schema 中通过 `"type": ["string", "null"]` 表示），解析后可能为 `None`。
