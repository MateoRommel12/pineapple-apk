# 🍍 Pineapple Sweetness Computation Explanation

## Overview
The app calculates pineapple sweetness using a **weighted average formula** based on ML model predictions and probabilities.

---

## 📊 Computation Flow

### Step 1: Backend ML Model Analysis
The backend ML model analyzes the pineapple image and returns:
- **Prediction**: One of `'High'`, `'Medium'`, or `'Low'` (the most likely class)
- **Probabilities**: Confidence scores for each class (values between 0-1)
  ```typescript
  {
    High?: number,    // e.g., 0.85 (85% confidence)
    Medium?: number,  // e.g., 0.12 (12% confidence)
    Low?: number      // e.g., 0.03 (3% confidence)
  }
  ```

### Step 2: Convert to Sweetness Percentage (0-100 scale)

The app uses the `convertClassToSweetness()` function located in `services/apiService.ts` (lines 693-713).

#### **Method 1: Weighted Average (Preferred)**
When probabilities are available, it calculates a weighted average:

```typescript
sweetness = (High_probability × 95) + (Medium_probability × 65) + (Low_probability × 25)
```

**Base Sweetness Values:**
- **High** class = **95%** sweetness
- **Medium** class = **65%** sweetness  
- **Low** class = **25%** sweetness

**Example Calculation:**
```
If probabilities are:
  High: 0.70 (70%)
  Medium: 0.25 (25%)
  Low: 0.05 (5%)

Sweetness = (0.70 × 95) + (0.25 × 65) + (0.05 × 25)
          = 66.5 + 16.25 + 1.25
          = 84% (rounded)
```

#### **Method 2: Simple Mapping (Fallback)**
If probabilities are not available, it uses simple class mapping:

```typescript
'High'   → 85% sweetness
'Medium' → 65% sweetness
'Low'    → 35% sweetness
default  → 50% sweetness
```

---

## 🎯 Sweetness Thresholds & Classifications

After computing the sweetness percentage, the app categorizes it:

### **Sweetness Categories** (lines 718-723)
```typescript
≥ 80% → "High Sweetness"
≥ 60% → "Medium Sweetness"
≥ 40% → "Low Sweetness"
< 40% → "Very Low Sweetness"
```

### **Display Titles** (lines 728-733)
```typescript
≥ 75% → "High"
≥ 60% → "Medium"
≥ 45% → "Low"
< 45% → "Very Low"
```

### **Color Indicators** (lines 738-743)
```typescript
≥ 75% → Green (#22C55E)
≥ 60% → Blue (#3B82F6)
≥ 45% → Amber (#F59E0B)
< 45% → Gray (#6B7280)
```

### **Recommendations** (lines 748-753)
```typescript
≥ 75% → "Perfect for eating"
≥ 60% → "Great for most uses"
≥ 45% → "Best for cooking"
< 45% → "Wait a few days"
```

### **Ripeness Assessment** (lines 670-672)
```typescript
≥ 70% → "Ready"
≥ 50% → "Good"
< 50% → "Wait"
```

### **Best Use** (lines 670-672)
```typescript
≥ 60% → "Eat fresh"
< 60% → "Cook with it"
```

---

## 📝 Code Location

**Main Computation Function:**
- File: `services/apiService.ts`
- Function: `convertClassToSweetness()` (lines 693-713)
- Called from: `transformBackendResponse()` (line 653)

**Helper Functions:**
- `getSweetnessCategory()` - lines 718-723
- `getDisplayTitle()` - lines 728-733
- `getColorIndicator()` - lines 738-743
- `getRecommendation()` - lines 748-753

---

## 🔍 Example Scenarios

### Scenario 1: High Confidence High Sweetness
```
Backend Response:
  prediction: "High"
  probabilities: { High: 0.90, Medium: 0.08, Low: 0.02 }

Computation:
  Sweetness = (0.90 × 95) + (0.08 × 65) + (0.02 × 25)
            = 85.5 + 5.2 + 0.5
            = 91% (rounded)

Result:
  Category: "High Sweetness"
  Display: "High"
  Color: Green
  Recommendation: "Perfect for eating"
  Ripeness: "Ready"
```

### Scenario 2: Mixed Probabilities
```
Backend Response:
  prediction: "Medium"
  probabilities: { High: 0.30, Medium: 0.60, Low: 0.10 }

Computation:
  Sweetness = (0.30 × 95) + (0.60 × 65) + (0.10 × 25)
            = 28.5 + 39 + 2.5
            = 70% (rounded)

Result:
  Category: "Medium Sweetness"
  Display: "Medium"
  Color: Blue
  Recommendation: "Great for most uses"
  Ripeness: "Ready"
```

### Scenario 3: Low Sweetness
```
Backend Response:
  prediction: "Low"
  probabilities: { High: 0.05, Medium: 0.20, Low: 0.75 }

Computation:
  Sweetness = (0.05 × 95) + (0.20 × 65) + (0.75 × 25)
            = 4.75 + 13 + 18.75
            = 37% (rounded)

Result:
  Category: "Low Sweetness"
  Display: "Low"
  Color: Amber
  Recommendation: "Best for cooking"
  Ripeness: "Wait"
```

---

## 🧮 Formula Summary

**Weighted Average Formula:**
```
Sweetness (%) = (P(High) × 95) + (P(Medium) × 65) + (P(Low) × 25)

Where:
  P(High)   = Probability of High class (0-1)
  P(Medium) = Probability of Medium class (0-1)
  P(Low)    = Probability of Low class (0-1)
  
  P(High) + P(Medium) + P(Low) = 1.0
```

**Final Result:**
- Sweetness percentage is rounded to nearest integer
- Range: 0-100%
- Used to determine all UI elements (colors, recommendations, categories)

---

## 💡 Why This Approach?

1. **Weighted Average**: Provides more nuanced results than simple class mapping
2. **Probabilistic**: Accounts for model uncertainty
3. **Smooth Transitions**: Avoids hard boundaries between categories
4. **User-Friendly**: Converts technical ML outputs to understandable percentages

