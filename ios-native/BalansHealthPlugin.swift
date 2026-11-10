import Foundation
import HealthKit
import Capacitor

@objc(BalansHealthPlugin)
public class BalansHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BalansHealthPlugin"
    public let jsName = "BalansHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAccess", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readSteps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readWeights", returnType: CAPPluginReturnPromise)
    ]
    private let store = HKHealthStore()
    private var types: Set<HKObjectType> {
        [HKObjectType.quantityType(forIdentifier: .stepCount)!, HKObjectType.quantityType(forIdentifier: .bodyMass)!]
    }

    @objc func requestAccess(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.reject("HealthKit är inte tillgängligt på den här enheten."); return }
        store.requestAuthorization(toShare: [], read: types) { _, error in
            if let error = error { call.reject(error.localizedDescription); return }
            // iOS avslöjar inte om användaren beviljade läsbehörighet.
            call.resolve(["requested": true])
        }
    }

    @objc func readSteps(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.reject("HealthKit saknas."); return }
        let days = max(1, min(90, call.getInt("days") ?? 30))
        let calendar = Calendar.current
        let end = Date()
        let start = calendar.date(byAdding: .day, value: -(days - 1), to: calendar.startOfDay(for: end))!
        let interval = DateComponents(day: 1)
        let type = HKQuantityType.quantityType(forIdentifier: .stepCount)!
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
        let query = HKStatisticsCollectionQuery(quantityType: type, quantitySamplePredicate: predicate, options: .cumulativeSum, anchorDate: calendar.startOfDay(for: end), intervalComponents: interval)
        query.initialResultsHandler = { _, collection, error in
            if let error = error { call.reject(error.localizedDescription); return }
            var result: [[String: Any]] = []
            let formatter = DateFormatter(); formatter.calendar = calendar; formatter.locale = Locale(identifier: "en_US_POSIX"); formatter.dateFormat = "yyyy-MM-dd"
            collection?.enumerateStatistics(from: start, to: end) { stat, _ in
                let count = Int((stat.sumQuantity()?.doubleValue(for: .count()) ?? 0).rounded())
                result.append(["date": formatter.string(from: stat.startDate), "count": count])
            }
            call.resolve(["days": result])
        }
        store.execute(query)
    }

    @objc func readWeights(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.reject("HealthKit saknas."); return }
        let type = HKQuantityType.quantityType(forIdentifier: .bodyMass)!
        let start = Calendar.current.date(byAdding: .day, value: -90, to: Date())!
        let query = HKSampleQuery(sampleType: type, predicate: HKQuery.predicateForSamples(withStart: start, end: Date()), limit: 200, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]) { _, samples, error in
            if let error = error { call.reject(error.localizedDescription); return }
            let formatter = DateFormatter(); formatter.locale = Locale(identifier: "en_US_POSIX"); formatter.dateFormat = "yyyy-MM-dd"
            let items = (samples as? [HKQuantitySample] ?? []).map { sample in
                ["date": formatter.string(from: sample.endDate), "value": sample.quantity.doubleValue(for: .gramUnit(with: .kilo))] as [String: Any]
            }
            call.resolve(["weights": items])
        }
        store.execute(query)
    }
}
