use serde_yaml::{Mapping, Value};

pub fn convert_buster_to_dbt_model(buster_yaml: &str) -> Result<String, anyhow::Error> {
    let mut yaml_value: Value = serde_yaml::from_str(buster_yaml)?;
    
    if let Value::Mapping(ref mut map) = yaml_value {
        if let Some(Value::Sequence(semantic_models)) = map.get_mut("semantic_models") {
            for model in semantic_models.iter_mut() {
                if let Value::Mapping(model_map) = model {
                    // Remove Buster-specific fields
                    model_map.remove("aliases");
                    
                    // Clean up entities
                    if let Some(Value::Sequence(entities)) = model_map.get_mut("entities") {
                        for entity in entities.iter_mut() {
                            if let Value::Mapping(entity_map) = entity {
                                entity_map.remove("join_type");
                                entity_map.remove("relationship_type");
                            }
                        }
                    }

                    // Clean up dimensions
                    if let Some(Value::Sequence(dimensions)) = model_map.get_mut("dimensions") {
                        for dim in dimensions.iter_mut() {
                            if let Value::Mapping(dim_map) = dim {
                                dim_map.remove("searchable");
                                dim_map.remove("alias");
                                dim_map.remove("timezone");
                                dim_map.remove("sql");
                            }
                        }
                    }

                    // Clean up measures
                    if let Some(Value::Sequence(measures)) = model_map.get_mut("measures") {
                        for measure in measures.iter_mut() {
                            if let Value::Mapping(measure_map) = measure {
                                measure_map.remove("alias");
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(serde_yaml::to_string(&yaml_value)?)
}
