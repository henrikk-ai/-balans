require 'fileutils'
require 'xcodeproj'
require 'plist'

project_path = 'ios/App/App.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'App' }
abort 'App target not found' unless target

folder = project.main_group.find_subpath('App', true)

# Kopiera endast HealthKit-pluginen.
name = 'BalansHealthPlugin.swift'
source = "ios-native/#{name}"
destination = "ios/App/App/#{name}"

abort "Missing file: #{source}" unless File.exist?(source)

FileUtils.cp(source, destination)

ref = folder.files.find { |f| f.path == name } ||
      folder.new_file(name)

unless target.source_build_phase.files_references.include?(ref)
  target.add_file_references([ref])
end

# HealthKit-behorigheter.
plist_path = 'ios/App/App/Info.plist'
plist = Plist.parse_xml(plist_path)

plist['NSHealthShareUsageDescription'] =
  'Balans läser dina steg och vikt från Apple Hälsa.'

File.write(plist_path, plist.to_plist)

entitlements_path = 'ios/App/App/App.entitlements'

File.write(
  entitlements_path,
  { 'com.apple.developer.healthkit' => true }.to_plist
)

target.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] =
    'App/App.entitlements'
end

# Registrera pluginen i Capacitors standardcontroller.
app_delegate = 'ios/App/App/AppDelegate.swift'
abort 'AppDelegate.swift saknas' unless File.exist?(app_delegate)

swift = File.read(app_delegate)

unless swift.include?('registerPlugin(BalansHealthPlugin.self)')
  swift = swift.sub(
    /(\bfunc application\()/,
    "override func capacitorDidLoad() {\n" \
    "    super.capacitorDidLoad()\n" \
    "    bridge?.registerPluginInstance(BalansHealthPlugin())\n" \
    "}\n\n\\1"
  )
end

File.write(app_delegate, swift)

project.save

puts 'HealthKit konfigurerat.'
