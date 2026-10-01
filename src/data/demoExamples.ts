import { DemoExample } from '../types/debug';

export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'demo-python-attr',
    title: 'Python AttributeError',
    language: 'python',
    badge: 'Python 3.11',
    description: 'Attempting to access .name attribute on an uninitialized or None user object.',
    errorText: `Traceback (most recent call last):
  File "app/controllers/user.py", line 42, in get_user_profile
    profile_data = {
  File "app/services/user_service.py", line 18, in format_name
    return user.name.upper()
AttributeError: 'NoneType' object has no attribute 'name'`,
    codeText: `def get_user_profile(user_id):
    user = fetch_user_from_db(user_id)
    # Bug: user can be None if not found in database!
    formatted_name = user.name.upper()
    return {
        "id": user_id,
        "name": formatted_name,
        "email": user.email
    }`
  },
  {
    id: 'demo-js-typeerror',
    title: 'JavaScript TypeError',
    language: 'javascript',
    badge: 'Node / React',
    description: 'Cannot read properties of undefined when mapping over an API response key.',
    errorText: `Uncaught TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (UserList.jsx:14:28)
    at renderWithHooks (react-dom.development.js:16305)
    at mountIndeterminateComponent (react-dom.development.js:20074)
    at beginWork (react-dom.development.js:21587)`,
    codeText: `import React, { useEffect, useState } from 'react';

export function UserList() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(resData => setData(resData));
  }, []);

  // Bug: data is initially null, and response may wrap list inside resData.users!
  return (
    <ul className="user-grid">
      {data.map(user => (
        <li key={user.id}>{user.name} ({user.email})</li>
      ))}
    </ul>
  );
}`
  },
  {
    id: 'demo-java-npe',
    title: 'Java NullPointerException',
    language: 'java',
    badge: 'Java 17',
    description: 'NullPointerException when invoking method on unassigned reference.',
    errorText: `Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.trim()" because "input" is null
    at com.dev.service.OrderProcessor.processOrder(OrderProcessor.java:27)
    at com.dev.Main.main(Main.java:12)`,
    codeText: `package com.dev.service;

public class OrderProcessor {
    public void processOrder(String customerCode, double amount) {
        // Bug: customerCode might be null from API parameter!
        String normalizedCode = customerCode.trim().toUpperCase();
        
        if (normalizedCode.startsWith("VIP")) {
            applyDiscount(amount, 0.20);
        } else {
            applyStandard(amount);
        }
    }
}`
  },
  {
    id: 'demo-cpp-segfault',
    title: 'C++ Segmentation Fault',
    language: 'cpp',
    badge: 'C++ 20',
    description: 'Dereferencing an uninitialized or dangling pointer.',
    errorText: `[1]    34812 segmentation fault (core dumped)  ./bin/matrix_solver
Signal 11 (SIGSEGV) received at address 0x00000000`,
    codeText: `#include <iostream>
#include <vector>

struct Node {
    int id;
    std::string label;
};

void processGraphNode(Node* node) {
    // Bug: pointer 'node' is nullptr if lookup failed!
    std::cout << "Processing node #" << node->id << ": " << node->label << std::endl;
}

int main() {
    Node* activeNode = nullptr;
    processGraphNode(activeNode);
    return 0;
}`
  },
  {
    id: 'demo-sql-syntax',
    title: 'SQL Syntax Error',
    language: 'sql',
    badge: 'PostgreSQL',
    description: 'Missing comma and incorrect clause ordering in aggregate query.',
    errorText: `ERROR:  syntax error at or near "WHERE"
LINE 4: WHERE created_at >= '2024-01-01'
        ^
SQL state: 42601`,
    codeText: `SELECT 
    user_id,
    COUNT(id) AS total_orders
    SUM(total_amount) AS revenue
FROM orders
WHERE created_at >= '2024-01-01'
GROUP BY user_id
HAVING SUM(total_amount) > 500
ORDER BY revenue DESC;`
  },
  {
    id: 'demo-go-panic',
    title: 'Go Slice Out of Bounds',
    language: 'go',
    badge: 'Go 1.22',
    description: 'panic: runtime error: index out of range [3] with length 3.',
    errorText: `panic: runtime error: index out of range [3] with length 3

goroutine 1 [running]:
main.calculateMetrics(0xc0000ae000?, 0x3?)
        /app/metrics/calculator.go:19 +0x85
main.main()
        /app/main.go:10 +0x25`,
    codeText: `package main

import "fmt"

func calculateMetrics(scores []float64) float64 {
    // Bug: looping using <= len(scores) instead of < len(scores)
    total := 0.0
    for i := 0; i <= len(scores); i++ {
        total += scores[i]
    }
    return total / float64(len(scores))
}

func main() {
    scores := []float64{98.5, 87.0, 92.3}
    avg := calculateMetrics(scores)
    fmt.Printf("Average: %.2f\n", avg)
}`
  }
];
