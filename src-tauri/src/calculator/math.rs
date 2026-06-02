use meval::Expr;
use std::str::FromStr;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum MathError {
    #[error("Invalid expression: {0}")]
    InvalidExpression(String),
    #[allow(dead_code)]
    #[error("Division by zero")]
    DivisionByZero,
    #[allow(dead_code)]
    #[error("Overflow")]
    Overflow,
    #[error("Math domain error (e.g., sqrt of negative)")]
    DomainError,
}

#[allow(dead_code)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum MathConstant {
    Pi,
    E,
}

pub struct MathEvaluator;

impl MathEvaluator {
    pub fn new() -> Self {
        Self
    }

    pub fn evaluate(&self, expression: &str) -> Result<f64, MathError> {
        let normalized = Self::normalize(expression)?;
        
        let expr = Expr::from_str(&normalized)
            .map_err(|e| MathError::InvalidExpression(e.to_string()))?;

        let result = expr.eval()
            .map_err(|e| MathError::InvalidExpression(e.to_string()))?;

        if !result.is_finite() {
            return Err(MathError::DomainError);
        }

        Ok(result)
    }

    fn normalize(expression: &str) -> Result<String, MathError> {
        let expr = expression.trim();
        
        if expr.is_empty() {
            return Err(MathError::InvalidExpression("Empty expression".to_string()));
        }

        let result = expr
            .replace("×", "*")
            .replace("÷", "/")
            .replace("PI", "pi");

        if result.chars().all(|c| c.is_numeric() || c == '.' || c == '-' || c == '+') {
            return Ok(result);
        }

        let result = Self::preprocess_functions(&result)?;

        if result.contains("..") {
            return Err(MathError::InvalidExpression("Invalid number format".to_string()));
        }

        Ok(result)
    }

    fn preprocess_functions(expr: &str) -> Result<String, MathError> {
        let mut result = expr.to_string();
        
        let functions = [
            ("sin", "sin"),
            ("cos", "cos"),
            ("tan", "tan"),
            ("asin", "asin"),
            ("acos", "acos"),
            ("atan", "atan"),
            ("sinh", "sinh"),
            ("cosh", "cosh"),
            ("tanh", "tanh"),
            ("sqrt", "sqrt"),
            ("ln", "ln"),
            ("log", "log"),
            ("log10", "log10"),
            ("log2", "log2"),
            ("abs", "abs"),
            ("floor", "floor"),
            ("ceil", "ceil"),
            ("round", "round"),
            ("exp", "exp"),
        ];

        for (from, to) in functions {
            // Only replace if from != to, but Clippy still complains about the whole block
            // because preprocess_functions itself might be redundant if no replacements are made.
            // But we do need case-insensitive replacements.
            let upper = from.to_uppercase();
            result = result.replace(&upper, to);
        }

        Ok(result)
    }

    pub fn format_result(value: f64) -> String {
        if value.is_nan() {
            return "Error".to_string();
        }

        if value.is_infinite() {
            return if value.is_sign_positive() { "∞" } else { "-∞" }.to_string();
        }

        let formatted = format!("{:.12}", value);
        let trimmed = formatted.trim_end_matches('0').trim_end_matches('.');
        
        if trimmed.len() > 15 {
            format!("{:.10e}", value)
        } else {
            trimmed.to_string()
        }
    }

    #[allow(dead_code)]
    pub fn is_valid_expression(expression: &str) -> bool {
        Self::new().evaluate(expression).is_ok()
    }
}

impl Default for MathEvaluator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_operations() {
        let evaluator = MathEvaluator::new();
        
        assert!((evaluator.evaluate("2 + 3").unwrap() - 5.0).abs() < 1e-10);
        assert!((evaluator.evaluate("10 - 4").unwrap() - 6.0).abs() < 1e-10);
        assert!((evaluator.evaluate("3 * 4").unwrap() - 12.0).abs() < 1e-10);
        assert!((evaluator.evaluate("15 / 3").unwrap() - 5.0).abs() < 1e-10);
    }

    #[test]
    fn test_complex_expressions() {
        let evaluator = MathEvaluator::new();
        
        assert!((evaluator.evaluate("2 + 3 * 4").unwrap() - 14.0).abs() < 1e-10);
        assert!((evaluator.evaluate("(2 + 3) * 4").unwrap() - 20.0).abs() < 1e-10);
        assert!((evaluator.evaluate("2^3").unwrap() - 8.0).abs() < 1e-10);
    }

    #[test]
    fn test_functions() {
        let evaluator = MathEvaluator::new();
        
        assert!((evaluator.evaluate("sqrt(16)").unwrap() - 4.0).abs() < 1e-10);
        assert!((evaluator.evaluate("sin(0)").unwrap()).abs() < 1e-10);
        assert!((evaluator.evaluate("log10(100)").unwrap() - 2.0).abs() < 1e-10);
    }

    #[test]
    fn test_constants() {
        let evaluator = MathEvaluator::new();
        
        assert!((evaluator.evaluate("pi").unwrap() - std::f64::consts::PI).abs() < 1e-10);
        assert!((evaluator.evaluate("e").unwrap() - std::f64::consts::E).abs() < 1e-10);
    }

    #[test]
    fn test_invalid_expressions() {
        let evaluator = MathEvaluator::new();
        
        assert!(evaluator.evaluate("").is_err());
        assert!(evaluate("abc").is_err());
    }

    fn evaluate(expr: &str) -> Result<f64, MathError> {
        MathEvaluator::new().evaluate(expr)
    }
}