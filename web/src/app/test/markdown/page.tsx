'use client';

import { AppMarkdown } from '@/components/text/AppMarkdown/AppMarkdown';
import { Button, InputNumber, Slider } from 'antd';
import { useRef, useState } from 'react';

const markdownContent = `

Here are some \`examples\` using ~single~ quotes:




<buster-timestamp status='inProgress' id='ff5ce44b-66a1-4fb0-9b1c-d815cccd2a7e' title='Thinking how to best answer your request...' milliseconds=''></buster-timestamp>



<buster-timestamp status='completed' id='ff5ce44b-66a1-4fb0-9b1c-d815cccd2a7e' title='Done thinking!' milliseconds=''></buster-timestamp>



<buster-timestamp status='inProgress' id='7b9d9171-f66b-4489-b844-efb22d6ce291' title='Picking dataset...' milliseconds=''></buster-timestamp>



<buster-timestamp status='completed' id='7b9d9171-f66b-4489-b844-efb22d6ce291' title='Picked dataset: Sales Dataset' milliseconds='0'></buster-timestamp>

You want to find out which three customers had the highest total sales amount in the past year. 

- We need to filter the sales data to only include records from the last year.
- We'll sum up the total sales amount for each customer.
- Then, we'll sort the customers by their total sales amount in descending order.
- Finally, we'll select the top 3 customers based on this sorted list.

Here's the SQL query to achieve that:

~~~sql
WITH last_year_sales AS (
    SELECT DISTINCT customer_id, customer_name, total_sales_amount
    FROM public.sales_summary
    WHERE order_date >= date_trunc('year', CURRENT_DATE) - interval '1 year'
)
SELECT customer_id, customer_name, SUM(total_sales_amount) AS total_sales
FROM last_year_sales
GROUP BY customer_id, customer_name
ORDER BY total_sales DESC
LIMIT 3;
~~~


<buster-timestamp status='inProgress' id='c60bb263-3c6e-4bbd-b1ad-908ca3c7c90d' title='Running SQL...' milliseconds=''></buster-timestamp>



<buster-timestamp status='completed' id='c60bb263-3c6e-4bbd-b1ad-908ca3c7c90d' title='SQL ran successfully' milliseconds='988'></buster-timestamp>



<buster-timestamp status='inProgress' id='3734e616-835c-4b93-b545-f8d531caebbc' title='Creating a visualization...' milliseconds=''></buster-timestamp>



<buster-timestamp status='completed' id='3734e616-835c-4b93-b545-f8d531caebbc' title='Visualization created' milliseconds=''></buster-timestamp>

Based on the SQL query results, let me break down the findings for you:

### Top 3 Customers by Sales Amount

1. **John Smith** - $543,210
   - Consistently high purchase volumes throughout the year
   - Particularly strong in Q4 with holiday season purchases
   - Primary categories: Electronics and Home Appliances

2. **Sarah Johnson** - $498,750
   - Notable increase in purchases compared to previous year
   - Regular bulk orders for business supplies
   - Most active during weekday business hours

3. **Michael Williams** - $425,890
   - New premium customer this year
   - High-value individual transactions
   - Luxury goods and premium services

### Key Insights

#### Purchase Patterns
- All three customers show consistent monthly purchasing activity
- Average transaction value is 45% higher than other customers
- Weekend purchases account for 35% of total sales

#### Customer Loyalty Metrics
- Combined loyalty program points: 2.5M
- Average customer tenure: 4.3 years
- All three participate in our premium membership program

#### Growth Opportunities

1. **Cross-selling Potential**
   - Identify complementary products based on purchase history
   - Personalized recommendations for each customer
   - Bundle offers tailored to their preferences

2. **Service Enhancement**
   - Dedicated account managers assigned
   - Priority shipping options
   - Exclusive early access to new products

### Recommendations

1. **Retention Strategy**
   - Implement VIP customer service program
   - Exclusive event invitations
   - Personalized thank you notes for major purchases

2. **Growth Plan**
   - Develop targeted marketing campaigns
   - Create custom product bundles
   - Establish quarterly review meetings

3. **Risk Mitigation**
   - Monitor satisfaction scores
   - Track competitor offerings
   - Regular feedback sessions

This analysis provides valuable insights into our top customers' buying behaviors and preferences, helping us better serve their needs while identifying opportunities for growth.


`;

export default function MarkdownTest() {
  const [start, setStart] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState(285);

  return (
    <div className="flex h-full w-[80vw] space-x-6 bg-white p-4">
      <div className="pagemarkdown w-full border">
        <AppMarkdown
          className="max-h-[300px] overflow-y-auto pb-10"
          markdown={start ? markdownContent : ''}
          showLoader={true}
        />
      </div>

      <div className="mt-12 flex w-[200px] flex-col gap-2 border">
        <Button onClick={() => setStart(!start)}>{start ? 'Stop' : 'Start'}</Button>
        <Slider
          min={1}
          max={1000}
          value={streamSpeed}
          onChange={(value) => setStreamSpeed(value)}
        />
      </div>
    </div>
  );
}
