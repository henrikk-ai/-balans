require 'fileutils'
require 'xcodeproj'
require 'plist'
require 'rexml/document'

project_path = 'ios/App/App.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'App' }
abort 'App target not found' unless target

folder = project.main_group.find_subpath('App', true)

# Kopiera plugin och egen bryggcontroller.
%w[BalansHealthPlugin.swift BalansBridgeViewController.swift].each do |name|
# Registrera pluginen via en egen CAPBridgeViewController.
# AppDelegate ska INTE modifieras.
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
