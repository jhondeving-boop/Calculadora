use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ProgrammerError {
    #[error("Invalid base: {0}")]
    InvalidBase(String),
    #[allow(dead_code)]
    #[error("Invalid digit for base: {0}")]
    InvalidDigit(String),
    #[error("Overflow: number too large")]
    Overflow,
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum Base {
    Hex,
    Dec,
    Oct,
    Bin,
}

impl Base {
    pub fn from_str(s: &str) -> Result<Self, ProgrammerError> {
        match s.to_uppercase().as_str() {
            "HEX" => Ok(Base::Hex),
            "DEC" => Ok(Base::Dec),
            "OCT" => Ok(Base::Oct),
            "BIN" => Ok(Base::Bin),
            _ => Err(ProgrammerError::InvalidBase(s.to_string())),
        }
    }

    pub fn radix(&self) -> u32 {
        match self {
            Base::Hex => 16,
            Base::Dec => 10,
            Base::Oct => 8,
            Base::Bin => 2,
        }
    }

    #[allow(dead_code)]
    pub fn max_value(&self) -> u64 {
        match self {
            Base::Hex => u64::MAX,
            Base::Dec => 2_147_483_647,
            Base::Oct => u64::MAX,
            Base::Bin => u64::MAX,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaseConversion {
    pub hex: String,
    pub dec: String,
    pub oct: String,
    pub bin: String,
    pub input_base: String,
    pub input_value: String,
}

pub struct ProgrammerConverter;

impl ProgrammerConverter {
    pub fn new() -> Self {
        Self
    }

    pub fn convert_all(value: &str, from_base: Base) -> Result<BaseConversion, ProgrammerError> {
        let value = value.trim();
        
        if value.is_empty() {
            return Ok(Self::empty_conversion(from_base));
        }

        let int_value = Self::parse_value(value, from_base)?;
        
        if int_value > i64::MAX as u64 {
            return Err(ProgrammerError::Overflow);
        }

        let int_value = int_value as i64;

        let hex = Self::format_int(int_value, 16, false);
        let dec = Self::format_int(int_value, 10, false);
        let oct = Self::format_int(int_value, 8, false);
        let bin = Self::format_binary(int_value);

        Ok(BaseConversion {
            hex,
            dec,
            oct,
            bin,
            input_base: format!("{:?}", from_base),
            input_value: value.to_string(),
        })
    }

    #[allow(dead_code)]
    pub fn convert(value: &str, from_base: Base, to_base: Base) -> Result<String, ProgrammerError> {
        let int_value = Self::parse_value(value, from_base)?;
        Ok(Self::format_int(int_value as i64, to_base.radix() as i32, to_base == Base::Bin))
    }

    fn parse_value(value: &str, base: Base) -> Result<u64, ProgrammerError> {
        let value = value.replace(' ', "");
        
        u64::from_str_radix(&value, base.radix())
            .map_err(|_| ProgrammerError::InvalidInput(value))
    }

    fn format_int(value: i64, base: i32, binary_group: bool) -> String {
        if value < 0 {
            let abs_val = value.unsigned_abs();
            let formatted = format_radix(abs_val, base);
            format!("-{}", formatted)
        } else {
            let formatted = format_radix(value as u64, base);
            if binary_group && base == 2 {
                Self::group_binary(&formatted)
            } else {
                formatted
            }
        }
    }

    fn format_binary(value: i64) -> String {
        if value < 0 {
            let abs_val = value.unsigned_abs();
            let formatted = format_radix(abs_val, 2);
            let padded = format!("{:064}", u64::from_str_radix(&formatted, 2).unwrap_or(0));
            Self::group_binary(&padded)
        } else {
            Self::group_binary(&format_radix(value as u64, 2))
        }
    }

    fn group_binary(binary: &str) -> String {
        let padded = if binary.len().is_multiple_of(4) {
            binary.to_string()
        } else {
            format!("{:0>width$}", binary, width = binary.len().div_ceil(4) * 4)
        };
        
        padded
            .chars()
            .collect::<Vec<_>>()
            .chunks(4)
            .map(|chunk| chunk.iter().collect::<String>())
            .collect::<Vec<_>>()
            .join(" ")
    }

    fn empty_conversion(from_base: Base) -> BaseConversion {
        BaseConversion {
            hex: "0".to_string(),
            dec: "0".to_string(),
            oct: "0".to_string(),
            bin: "0000".to_string(),
            input_base: format!("{:?}", from_base),
            input_value: "0".to_string(),
        }
    }

    #[allow(dead_code)]
    pub fn is_valid_digit(digit: &str, base: Base) -> bool {
        if digit.is_empty() {
            return false;
        }
        
        let digit = digit.to_uppercase();
        let first_char = digit.chars().next().unwrap();
        
        match base {
            Base::Bin => matches!(first_char, '0' | '1'),
            Base::Oct => matches!(first_char, '0'..='7'),
            Base::Dec => digit.chars().all(|c| c.is_ascii_digit()),
            Base::Hex => digit.chars().all(|c| c.is_ascii_hexdigit()),
        }
    }

    #[allow(dead_code)]
    pub fn get_allowed_digits(base: Base) -> Vec<&'static str> {
        match base {
            Base::Bin => vec!["0", "1"],
            Base::Oct => vec!["0", "1", "2", "3", "4", "5", "6", "7"],
            Base::Dec => vec!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            Base::Hex => vec!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"],
        }
    }
}

fn format_radix(mut n: u64, base: i32) -> String {
    if n == 0 {
        return "0".to_string();
    }

    let digits = "0123456789ABCDEF";
    let mut result = Vec::new();
    
    while n > 0 {
        let digit = (n % base as u64) as usize;
        result.push(digits.chars().nth(digit).unwrap_or('0'));
        n /= base as u64;
    }
    
    result.reverse();
    result.into_iter().collect()
}

impl Default for ProgrammerConverter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dec_to_all() {
        let result = ProgrammerConverter::convert_all("255", Base::Dec).unwrap();
        assert_eq!(result.hex, "FF");
        assert_eq!(result.dec, "255");
        assert_eq!(result.oct, "377");
        assert_eq!(result.bin, "1111 1111");
    }

    #[test]
    fn test_hex_to_all() {
        let result = ProgrammerConverter::convert_all("FF", Base::Hex).unwrap();
        assert_eq!(result.hex, "FF");
        assert_eq!(result.dec, "255");
        assert_eq!(result.oct, "377");
    }

    #[test]
    fn test_binary_conversion() {
        let result = ProgrammerConverter::convert_all("1010", Base::Bin).unwrap();
        assert_eq!(result.hex, "A");
        assert_eq!(result.dec, "10");
        assert_eq!(result.oct, "12");
    }

    #[test]
    fn test_allowed_digits() {
        assert_eq!(ProgrammerConverter::get_allowed_digits(Base::Bin), vec!["0", "1"]);
        assert_eq!(ProgrammerConverter::get_allowed_digits(Base::Hex).len(), 16);
    }

    #[test]
    fn test_valid_digit() {
        assert!(ProgrammerConverter::is_valid_digit("F", Base::Hex));
        assert!(ProgrammerConverter::is_valid_digit("9", Base::Dec));
        assert!(!ProgrammerConverter::is_valid_digit("A", Base::Dec));
        assert!(!ProgrammerConverter::is_valid_digit("2", Base::Bin));
    }
}