const InterestSectionCard = ({ title, subtitle, total, colorFrom, colorTo }) => (
  <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 mb-6 flex justify-between items-center">
    <div>
      <h2 className="text-lg xs:text-xl font-semibold mb-1 text-white">{title}</h2>
      <p className="text-neutral-400 xs:text-sm text-xs">{subtitle}</p>
    </div>
    <div className="text-right">
      <p className="text-sm text-neutral-400 mb-1">Total Active Time</p>
      <p
        className={`text-xl xs:text-2xl font-mono font-bold bg-gradient-to-r ${colorFrom} ${colorTo} bg-clip-text text-transparent`}
      >
        {total}
      </p>
    </div>
  </div>
)

export default InterestSectionCard