use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConverterError {
    #[error("Invalid category: {0}")]
    Category(String),
    #[error("Invalid unit: {0}")]
    Unit(String),
    #[error("Invalid value: {0}")]
    Value(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionCategory {
    pub name: String,
    pub units: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionResult {
    pub result: String,
    pub from_unit: String,
    pub to_unit: String,
    pub value: f64,
}

pub struct UnitConverter;

impl UnitConverter {
    pub fn new() -> Self {
        Self
    }

    pub fn get_categories() -> Vec<ConversionCategory> {
        vec![
            ConversionCategory {
                name: "Longitud".to_string(),
                units: HashMap::from([
                    ("Metros".to_string(), 1.0),
                    ("Kilómetros".to_string(), 1000.0),
                    ("Centímetros".to_string(), 0.01),
                    ("Milímetros".to_string(), 0.001),
                    ("Millas".to_string(), 1609.344),
                    ("Yardas".to_string(), 0.9144),
                    ("Pies".to_string(), 0.3048),
                    ("Pulgadas".to_string(), 0.0254),
                ]),
            },
            ConversionCategory {
                name: "Peso".to_string(),
                units: HashMap::from([
                    ("Kilogramos".to_string(), 1.0),
                    ("Gramos".to_string(), 0.001),
                    ("Miligramos".to_string(), 0.000001),
                    ("Libras".to_string(), 0.453592),
                    ("Onzas".to_string(), 0.0283495),
                    ("Toneladas".to_string(), 1000.0),
                ]),
            },
            ConversionCategory {
                name: "Temperatura".to_string(),
                units: HashMap::from([
                    ("Celsius".to_string(), 1.0),
                    ("Fahrenheit".to_string(), 1.0),
                    ("Kelvin".to_string(), 1.0),
                ]),
            },
            ConversionCategory {
                name: "Volumen".to_string(),
                units: HashMap::from([
                    ("Litros".to_string(), 1.0),
                    ("Mililitros".to_string(), 0.001),
                    ("Galones".to_string(), 3.78541),
                    ("Onzas fluidas".to_string(), 0.0295735),
                    ("Metros cúbicos".to_string(), 1000.0),
                ]),
            },
            ConversionCategory {
                name: "Área".to_string(),
                units: HashMap::from([
                    ("Metros²".to_string(), 1.0),
                    ("Kilómetros²".to_string(), 1000000.0),
                    ("Hectáreas".to_string(), 10000.0),
                    ("Acres".to_string(), 4046.8564224),
                    ("Pies²".to_string(), 0.092903),
                ]),
            },
            ConversionCategory {
                name: "Velocidad".to_string(),
                units: HashMap::from([
                    ("m/s".to_string(), 1.0),
                    ("km/h".to_string(), 0.277778),
                    ("mph".to_string(), 0.44704),
                    ("knots".to_string(), 0.514444),
                ]),
            },
            ConversionCategory {
                name: "Tiempo".to_string(),
                units: HashMap::from([
                    ("Segundos".to_string(), 1.0),
                    ("Minutos".to_string(), 60.0),
                    ("Horas".to_string(), 3600.0),
                    ("Días".to_string(), 86400.0),
                    ("Semanas".to_string(), 604800.0),
                ]),
            },
            ConversionCategory {
                name: "Datos".to_string(),
                units: HashMap::from([
                    ("Bytes".to_string(), 1.0),
                    ("Kilobytes".to_string(), 1024.0),
                    ("Megabytes".to_string(), 1048576.0),
                    ("Gigabytes".to_string(), 1073741824.0),
                    ("Terabytes".to_string(), 1099511627776.0),
                    ("Bits".to_string(), 0.125),
                ]),
            },
        ]
    }

    pub fn convert(
        value: f64,
        category: &str,
        from_unit: &str,
        to_unit: &str,
    ) -> Result<ConversionResult, ConverterError> {
        if value.is_nan() || !value.is_finite() {
            return Err(ConverterError::Value("Invalid number".to_string()));
        }

        let categories = Self::get_categories();
        
        let cat = categories
            .iter()
            .find(|c| c.name == category)
            .ok_or_else(|| ConverterError::Category(category.to_string()))?;

        if category == "Temperatura" {
            let result = Self::convert_temperature(value, from_unit, to_unit)?;
            return Ok(ConversionResult {
                result: format!("{:.4}", result),
                from_unit: from_unit.to_string(),
                to_unit: to_unit.to_string(),
                value,
            });
        }

        let from_factor = cat.units
            .get(from_unit)
            .ok_or_else(|| ConverterError::Unit(from_unit.to_string()))?;
        
        let to_factor = cat.units
            .get(to_unit)
            .ok_or_else(|| ConverterError::Unit(to_unit.to_string()))?;

        let base_value = value * from_factor;
        let final_value = base_value / to_factor;

        let formatted = if final_value.abs() >= 1000.0 || (final_value.abs() < 0.0001 && final_value != 0.0) {
            format!("{:.2e}", final_value)
        } else {
            format!("{:.6}", final_value).trim_end_matches('0').trim_end_matches('.').to_string()
        };

        Ok(ConversionResult {
            result: formatted,
            from_unit: from_unit.to_string(),
            to_unit: to_unit.to_string(),
            value,
        })
    }

    fn convert_temperature(value: f64, from: &str, to: &str) -> Result<f64, ConverterError> {
        let to_celsius = |v: f64, unit: &str| -> Result<f64, ConverterError> {
            match unit {
                "Celsius" => Ok(v),
                "Fahrenheit" => Ok((v - 32.0) * 5.0 / 9.0),
                "Kelvin" => {
                    if v < 0.0 {
                        Err(ConverterError::Value("Kelvin cannot be negative".to_string()))
                    } else {
                        Ok(v - 273.15)
                    }
                }
                _ => Err(ConverterError::Unit(unit.to_string())),
            }
        };

        let from_celsius = |v: f64, unit: &str| -> Result<f64, ConverterError> {
            match unit {
                "Celsius" => Ok(v),
                "Fahrenheit" => Ok(v * 9.0 / 5.0 + 32.0),
                "Kelvin" => Ok(v + 273.15),
                _ => Err(ConverterError::Unit(unit.to_string())),
            }
        };

        let celsius = to_celsius(value, from)?;
        from_celsius(celsius, to)
    }

    #[allow(dead_code)]
    pub fn get_units_for_category(category: &str) -> Result<Vec<String>, ConverterError> {
        let categories = Self::get_categories();
        
        let cat = categories
            .iter()
            .find(|c| c.name == category)
            .ok_or_else(|| ConverterError::Category(category.to_string()))?;

        Ok(cat.units.keys().cloned().collect())
    }
}

impl Default for UnitConverter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_length_conversion() {
        let result = UnitConverter::convert(1000.0, "Longitud", "Metros", "Kilómetros").unwrap();
        assert!((result.result.parse::<f64>().unwrap() - 1.0).abs() < 0.001);
    }

    #[test]
    fn test_weight_conversion() {
        let result = UnitConverter::convert(1.0, "Peso", "Kilogramos", "Gramos").unwrap();
        assert!((result.result.parse::<f64>().unwrap() - 1000.0).abs() < 0.001);
    }

    #[test]
    fn test_temperature_conversion() {
        let result = UnitConverter::convert(100.0, "Temperatura", "Celsius", "Fahrenheit").unwrap();
        assert!((result.result.parse::<f64>().unwrap() - 212.0).abs() < 0.001);
    }

    #[test]
    fn test_data_conversion() {
        let result = UnitConverter::convert(1.0, "Datos", "Gigabytes", "Megabytes").unwrap();
        assert!((result.result.parse::<f64>().unwrap() - 1024.0).abs() < 0.001);
    }

    #[test]
    fn test_categories() {
        let categories = UnitConverter::get_categories();
        assert!(categories.len() >= 6);
        assert!(categories.iter().any(|c| c.name == "Longitud"));
    }
}