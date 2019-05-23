require "yaml"
require "process"

require "../helpers/messages"
require "../helpers/config"

module StartCommand
  def run
    self.read_config_file
  end

  def read_config_file
    file = ""

    begin
      file = File.read(File.expand_path("./caravel.yml"))
    rescue
      Messages::Error.file_not_found
      return
    end
    
    return Messages::Error.config_invalid if !self.validate_config_file(file)
    self.start_checking()
  end

  def validate_config_file(file : String)
    begin
      Config.from_yaml(file)
      return true
    rescue
      return false
    end
  end

  def read_config_file(file : String)
    return Config.from_yaml(file)
  end

  def start_checking()
    Process.exec("../caravel", ["check", "--recursive=true"])
  end
end