require "fileutils"
require 'xcodeproj'
require 'plist'
project_path = 'ios/App/App.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'App' }
abort 'App target not found' unless target
folder = project.main_group.find_subpath('App', true)
%w[BalansHealthPlugin.swift BalansBridgeViewController.swift].each do |name|
  path = "ios/App/App/#{name}"
  FileUtils.cp("native/#{name}", path)
  ref = folder.files.find { |f| f.path == name } || folder.new_file(name)
  target.add_file_references([ref]) unless target.source_build_phase.files_references.include?(ref)
end
plist_path = 'ios/App/App/Info.plist'
plist = Plist.parse_xml(plist_path)
plist['NSHealthShareUsageDescription'] = 'Balans läser dina steg och vikt från Apple Hälsa när du väljer att synkronisera.'
File.write(plist_path, plist.to_plist)
entitlements_path = 'ios/App/App/App.entitlements'
File.write(entitlements_path, { 'com.apple.developer.healthkit' => true }.to_plist)
target.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements'
end
storyboard = 'ios/App/App/Base.lproj/Main.storyboard'
if File.exist?(storyboard)
  text = File.read(storyboard)
  text = text.gsub('customClass="CAPBridgeViewController"', 'customClass="BalansBridgeViewController" customModule="App" customModuleProvider="target"')
  File.write(storyboard, text)
else
  abort 'Main.storyboard missing; cannot register native bridge'
end
project.save
puts 'HealthKit plugin, entitlement and bridge configured'
