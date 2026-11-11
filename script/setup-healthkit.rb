require 'fileutils'
require 'xcodeproj'
require 'plist'

project_path = 'ios/App/App.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'App' }
abort 'App target not found' unless target

folder = project.main_group.find_subpath('App', true)

%w[BalansHealthPlugin.swift BalansBridgeViewController.swift].each do |name|
  source = "ios-native/#{name}"
  destination = "ios/App/App/#{name}"

  abort "Missing file: #{source}" unless File.exist?(source)

  FileUtils.cp(source, destination)

  ref = folder.files.find { |f| f.path == name } ||
        folder.new_file(name)

  unless target.source_build_phase.files_references.include?(ref)
    target.add_file_references([ref])
  end
end

plist_path = 'ios/App/App/Info.plist'
plist = Plist.parse_xml(plist_path)

plist['NSHealthShareUsageDescription'] =
  'Balans läser dina steg och vikt från Apple Hälsa.'

plist['NSHealthUpdateUsageDescription'] =
  'Balans behöver tillstånd för att spara hälsouppgifter.'

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

# DIAGNOSTIK: Anvand Capacitors standardcontroller.
storyboard = 'ios/App/App/Base.lproj/Main.storyboard'

abort 'Main.storyboard saknas' unless File.exist?(storyboard)

text = File.read(storyboard)

# Aterstall enbart den controller som tidigare
# andrats till BalansBridgeViewController.
text = text.gsub(
  'customClass="BalansBridgeViewController"',
  'customClass="CAPBridgeViewController"'
)

File.write(storyboard, text)

puts 'DIAGNOSTIK: Capacitors standardcontroller aktiverad.'

project.save

puts 'DIAGNOSTIK: Capacitors standardvy används.'
puts 'HealthKit-filer finns kvar men pluginen registreras inte.'
