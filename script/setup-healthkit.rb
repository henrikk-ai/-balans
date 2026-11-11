require 'fileutils'

require 'xcodeproj'

require 'plist'

require 'rexml/document'

project_path = 'ios/App/App.xcodeproj'

project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'App' }

abort 'App target not found' unless target

folder = project.main_group.find_subpath('App', true)

# Kopiera HealthKit-pluginen och bryggcontrollern.

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

# HealthKit-behorigheter.

plist_path = 'ios/App/App/Info.plist'

plist = Plist.parse_xml(plist_path)

plist['NSHealthShareUsageDescription'] =
  'Balans läser dina steg och vikt från Apple Hälsa.'

plist['NSCameraUsageDescription'] =
  'Balans använder kameran för att fotografera måltider.'

plist['NSPhotoLibraryUsageDescription'] =
  'Balans använder bilder för att analysera måltider.'

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

# Registrera pluginen via egen bryggcontroller.

# AppDelegate.swift ändras inte.

storyboard = 'ios/App/App/Base.lproj/Main.storyboard'

abort 'Main.storyboard saknas' unless File.exist?(storyboard)

xml = REXML::Document.new(File.read(storyboard))

controller = nil

REXML::XPath.each(xml, '//viewController') do |element|

  if ['CAPBridgeViewController', 'BalansBridgeViewController'].include?(element.attributes['customClass'])

    controller = element

    break

  end

end

abort 'Capacitors viewController hittades inte' unless controller

controller.attributes['customClass'] = 'BalansBridgeViewController'

controller.attributes['customModule'] = 'App'

File.write(storyboard, xml.to_s)

project.save

puts 'HealthKit och BalansBridgeViewController konfigurerade.'

puts 'AppDelegate.swift har inte ändrats.'
