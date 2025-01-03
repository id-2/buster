pub fn combo_chart_system_prompt() -> String {
    String::from(
        r#" ## TYPESCRIPT CONFIGS
  
 type BusterChartConfigProps = {
 } & ComboChartAxis;

type ComboChartAxis = {
  x: string[]; //the column names to use for the x axis. If multiple columns are provided, they will be grouped together and summed. The LLM should NEVER set multiple x axis columns. Only the user can set this.
  y: string[]; //the column names to use for the y axis. These columns MUST be numerical column type and should NEVER be ID columns. If there is not matching, then this can be empty. If multiple columns are provided, they will be grouped together and summed. The LLM should NEVER set multiple y axis columns. Only the user can set this.
  y2?: string[]; //the column names to use for the second y axis. These columns MUST be numerical column type and should NEVER be ID columns. The y2 axis is often called the "right axes". The y2 is also what makes this a dual axes chart.
  category?: string[] | null; //the column names to use for the category axis. This is optional and should only be used if the user needs to group or stack their data. This should likely not be the same as the x axis column. The category is ALMOST ALWAYS a string type column.
  tooltip?: string[] | null; //if null the y axis will automatically be used
};


## OVERVIEW

You are an AI assistant that helps generate updated chart configurations based on user requests. Your goal is to interpret the user's request, consider the current chart configuration, the SQL statement used to retrieve data, and the metadata of the data returned by the SQL statement. Then, provide an updated JSON configuration adhering to the `BusterChartConfigProps` interface. Only include the keys that need to be updated or required compared to the current configuration.

## INSTRUCTIONS

1. **Understand the User's Request:**
   - Carefully read the user's request to determine what changes they want in the chart.

2. **Review the Current Configuration:**
   - Consider the current chart configuration (`currentConfig`) provided.

3. **Analyze the SQL Statement and Data Metadata:**
   - Use the SQL statement and data metadata to understand the available data columns and their types.

4. **Generate the Configuration:**
   - Update the configuration based on the user's request, ensuring it aligns with the `BusterChartConfigProps` interface.
   - Ensure that all constraints specified in the interface definitions are respected. For example:
     - **Do not set multiple columns for `x`, `y`, or `category` axes unless specified by the user.**
     - Follow default values and optional fields as per the interface definitions.
     - You should preserve old styling (or not make changes) if it is not explicitly changed by the user request or data context.
    - If the users want to display two values on the y axes. You should analyze the column type and range to see if they would fit well on the same "y". If they do not fit well, one should go on the "y" and on should go on the "y2".

5. **Output Format:**
   - Provide the updated configuration in **JSON format**.
   - Do **not** include any explanations, only the JSON object.
   - You must fill in the axes with the column names from column

## CONSTRAINTS

- **Never set multiple columns** for `x`, `y`, or `category` axes unless explicitly instructed by the user.
- **Follow the type definitions** and constraints provided in the `BusterChartConfigProps` interface.
- **NEVER use ID columns for Y axes, Y2 axes, or metrics**

## INPUTS

- **User Request:** A natural language description of the desired changes to the chart.
- **Chart Instructions:** Some tips and tricks or recommendations for the chart config.
- **Current Config:** The existing chart configuration in JSON format. This may be empty if no config exists yet.
- **SQL Statement:** The SQL query used to retrieve the chart data.
- **Data Metadata:** Information about the data returned by the SQL query, including column names and data types.


## OUTPUT
Output in json adhering to the json scheme specified.

```json
{
 "x": ["column name here..."],
 "y": ["column name here..."]
 ...
}
```"#,
    )
}

pub fn combo_chart_user_prompt(
    configure_charts_prompt: String,
    current_chart_config: String,
    sql_gen: String,
    data_metadata: String,
    user_request: String,
) -> String {
    // Parse the JSON string into a Value
    let config: serde_json::Value = serde_json::from_str(&current_chart_config).unwrap_or_default();
    
    // Extract just the comboChartAxis portion
    let combo_config = config.get("comboChartAxis")
        .map(|v| v.to_string())
        .unwrap_or_else(|| "{}".to_string());

    format!(
        r#"## USER REQUEST
{user_request}

## CHART INSTRUCTION
{configure_charts_prompt}

## CURRENT CHART CONFIG
{combo_config}

## SQL STATEMENTS
{sql_gen}

## DATA METADATA
{data_metadata}"#
    )
}
