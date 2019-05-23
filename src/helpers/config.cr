class Config
  YAML.mapping(
    name: String,
    repo: String,
    branch: String | Nil,
    run: Array(String)
  )
end