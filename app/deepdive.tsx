import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { saveGameResult } from './storage';
import { playTapSound, playCorrectSound, playWrongSound, playCelebration } from './sounds';
import {
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── PASSAGES (10 passages × 5 questions = 50 questions) ─────────────────────
const PASSAGES = [
  {
    id: 1,
    domain: 'D2',
    difficulty: 'Medium',
    title: 'The Ocean Conveyor Belt',
    text: 'The ocean is not a passive body of water but an active system that continuously redistributes heat, nutrients, and dissolved gases across the globe. At the heart of this system is thermohaline circulation, a process driven by differences in water temperature and salinity. Near the poles, cold dense water sinks to the ocean floor and travels slowly toward the equator. Meanwhile, warm surface water flows poleward to replace it, creating a vast conveyor belt that circles the entire planet.\n\nThis circulation has profound effects on global climate. The Gulf Stream, one component of this system, carries warm water from the tropics toward northwestern Europe, keeping countries like the United Kingdom and Norway far warmer than their latitudes would otherwise allow. Scientists have grown increasingly concerned that melting polar ice, by injecting large amounts of fresh water into the North Atlantic, could weaken or even halt this circulation. Fresh water is less dense than salt water and therefore less likely to sink, potentially disrupting the entire system. Climate models suggest that a significant slowdown could cool northern Europe dramatically while intensifying droughts in other regions, with consequences that would unfold over decades.',
    questions: [
      { question: 'What is the primary purpose of this passage?', options: ['To warn readers about the immediate dangers of climate change', 'To explain how thermohaline circulation works and why its disruption matters', 'To argue that Europe will experience catastrophic cooling', 'To describe the chemical composition of ocean water'], correct: 1, explanation: 'The passage explains the mechanism of thermohaline circulation and then discusses the potential consequences of its disruption.' },
      { question: 'According to the passage, what drives thermohaline circulation?', options: ['Wind patterns across the ocean surface', 'Differences in water temperature and salinity', 'Tidal forces from the moon and sun', 'The rotation of the Earth'], correct: 1, explanation: 'The passage directly states the process is "driven by differences in water temperature and salinity."' },
      { question: 'The passage suggests that northwestern Europe is warmer than expected because:', options: ['It receives more direct sunlight than other regions at its latitude', 'The Gulf Stream carries warm tropical water toward it', 'Its population centers generate significant heat', 'Volcanic activity warms the surrounding ocean'], correct: 1, explanation: 'The passage states the Gulf Stream "carries warm water from the tropics toward northwestern Europe, keeping countries like the United Kingdom and Norway far warmer than their latitudes would otherwise allow."' },
      { question: 'Why does the passage mention fresh water being less dense than salt water?', options: ['To explain why icebergs float', 'To show why melting ice could prevent deep water from sinking and disrupt circulation', 'To describe how ocean animals survive near the poles', 'To contrast fresh water rivers with ocean water'], correct: 1, explanation: 'The passage explains that fresh water from melting ice is less likely to sink, which is the mechanism by which it could disrupt thermohaline circulation.' },
      { question: 'Which best describes the author\'s tone in this passage?', options: ['Alarmed and emotionally urgent', 'Informative with measured concern', 'Dismissive of climate concerns', 'Celebratory of ocean science discoveries'], correct: 1, explanation: 'The author explains the science clearly while noting scientists\' growing concern, striking an informative but appropriately concerned tone.' },
    ],
  },
  {
    id: 2,
    domain: 'D2',
    difficulty: 'Medium',
    title: 'The Placebo Effect',
    text: 'For decades, scientists dismissed the placebo effect as a nuisance — a confounding variable to be eliminated from drug trials rather than a phenomenon worthy of study in its own right. That view has changed dramatically. Researchers now understand that when patients believe they are receiving effective treatment, their brains can produce measurable physiological changes, including the release of endorphins, dopamine, and other neurochemicals that genuinely reduce pain and improve symptoms.\n\nParticularly striking are studies involving open-label placebos, in which patients are explicitly told they are taking a sugar pill with no active ingredients. Counterintuitively, many of these patients still report significant improvements in conditions ranging from irritable bowel syndrome to chronic lower back pain. Researchers theorize that the ritual of treatment itself — the act of taking a pill, visiting a doctor, receiving care — activates conditioned healing responses built up through a lifetime of medical experiences. These findings have profound implications for how we design and evaluate medical treatments, and they raise philosophical questions about the boundary between belief and biology.',
    questions: [
      { question: 'How has the scientific view of the placebo effect changed according to the passage?', options: ['Scientists now believe placebos are more effective than real drugs', 'Placebos were once dismissed as noise but are now studied as real phenomena', 'Researchers have stopped including placebos in drug trials', 'The placebo effect has been proven to work only for pain conditions'], correct: 1, explanation: 'The passage opens by noting scientists once dismissed the placebo effect as a nuisance and states "That view has changed dramatically."' },
      { question: 'What is most significant about open-label placebo studies?', options: ['They show that all medical treatments are psychological', 'Patients improve even when told the pill contains no active ingredients', 'They prove that doctors cause more harm than good', 'They demonstrate that pain is entirely imaginary'], correct: 1, explanation: 'The passage describes open-label placebos as "counterintuitive" because patients improve despite being explicitly told they are taking sugar pills.' },
      { question: 'According to the passage, what likely explains why open-label placebos still work?', options: ['Patients secretly believe the pills contain medicine', 'The ritual of treatment activates conditioned healing responses', 'Sugar pills have mild pharmaceutical effects', 'Doctors unconsciously administer real treatments'], correct: 1, explanation: 'The passage states researchers theorize "the ritual of treatment itself activates conditioned healing responses built up through a lifetime of medical experiences."' },
      { question: 'The phrase "the boundary between belief and biology" suggests that:', options: ['Biology is more important than belief in medicine', 'The relationship between mental states and physical responses is complex and blurred', 'Beliefs have no effect on physical health', 'Biology can explain all aspects of human behavior'], correct: 1, explanation: 'This phrase reflects the passage\'s larger theme: that believing something can produce real biological changes, blurring the distinction between mental and physical.' },
      { question: 'What is the central claim of this passage?', options: ['Drug trials should eliminate all placebo groups', 'The placebo effect produces real physiological changes and deserves serious scientific study', 'Most medical treatments are no better than placebos', 'Open-label placebos should replace traditional medicine'], correct: 1, explanation: 'The passage argues that the placebo effect is a real, measurable physiological phenomenon worthy of serious study — not merely a confounding variable.' },
    ],
  },
  {
    id: 3,
    domain: 'D2',
    difficulty: 'Hard',
    title: 'Democracy and Short-Term Thinking',
    text: 'Democratic governments face a structural challenge that has received insufficient attention: the mismatch between electoral cycles and the timescale of the most pressing collective problems. Politicians who must win reelection every two to five years face powerful incentives to prioritize policies with visible short-term benefits over investments whose returns materialize only over decades. Infrastructure, climate mitigation, early childhood education, and pandemic preparedness all share this characteristic — they require sustained commitment and produce diffuse benefits that are difficult to attribute to any particular administration.\n\nThis is not a failure of individual character but a rational response to institutional incentives. A politician who invests in infrastructure that will not be completed until after she leaves office receives little electoral credit for her foresight. Meanwhile, her opponent can campaign on promises of immediate tax relief, trading long-term fiscal health for short-term popularity. Some democracies have attempted to address this problem through independent agencies, long-term budgeting requirements, or constitutional provisions that constrain short-term decision-making. Whether these mechanisms are sufficient to overcome the fundamental tension between democratic accountability and long-term governance remains an open and urgent question.',
    questions: [
      { question: 'What structural challenge does the passage identify in democratic governments?', options: ['Politicians are generally corrupt and self-serving', 'Electoral cycles create incentives to favor short-term benefits over long-term investments', 'Voters are too uninformed to make good decisions', 'Democratic constitutions prevent effective governance'], correct: 1, explanation: 'The passage identifies the mismatch between short electoral cycles and the long timescales of major collective problems as the central structural challenge.' },
      { question: 'According to the passage, why do politicians favor short-term policies?', options: ['They are personally greedy and selfish', 'Short-term policies are always better for citizens', 'They are responding rationally to incentives created by electoral systems', 'Voters demand immediate results and will not accept anything else'], correct: 2, explanation: 'The passage explicitly states "This is not a failure of individual character but a rational response to institutional incentives."' },
      { question: 'The example of the politician investing in infrastructure serves to:', options: ['Celebrate politicians who make courageous decisions', 'Illustrate how electoral incentives punish long-term thinking', 'Argue that infrastructure is the most important government priority', 'Show that voters always prefer tax relief over infrastructure'], correct: 1, explanation: 'The example illustrates that a politician receives little electoral credit for long-term investments, showing how the system punishes forward-thinking.' },
      { question: 'What does the passage suggest about independent agencies and long-term budgeting requirements?', options: ['They fully solve the problem of short-term thinking in democracies', 'They are unnecessary in well-functioning democracies', 'They are attempts to address the problem but their adequacy is uncertain', 'They undermine democratic accountability and should be abolished'], correct: 2, explanation: 'The passage mentions these mechanisms as attempts to address the problem while noting it remains an "open and urgent question" whether they are sufficient.' },
      { question: 'The author\'s attitude toward democratic governments can best be described as:', options: ['Deeply cynical and dismissive', 'Analytically critical while acknowledging real complexity', 'Unreservedly optimistic about democratic reform', 'Indifferent to questions of governance'], correct: 1, explanation: 'The author identifies a real structural problem with democracy without dismissing democratic systems, striking a critically engaged but balanced tone.' },
    ],
  },
  {
    id: 4,
    domain: 'D2',
    difficulty: 'Easy',
    title: 'The Printing Press',
    text: 'When Johannes Gutenberg developed his movable type printing press around 1440, he could not have anticipated the full scale of what he had set in motion. Before his invention, the production of books was an enormously labor-intensive process: a single scribe might spend months copying a single manuscript by hand, making books so expensive that only wealthy institutions and individuals could own them. Knowledge was concentrated in monasteries, universities, and royal courts.\n\nThe printing press shattered this concentration. Within fifty years of Gutenberg\'s invention, millions of books were in circulation across Europe. Literacy rates began climbing as reading material became affordable to a much broader population. The Protestant Reformation accelerated partly because Martin Luther\'s ideas could be printed and distributed across the continent faster than the Catholic Church could respond or suppress them. The Scientific Revolution benefited from researchers being able to share findings widely and build on each other\'s work in ways that were previously impossible. In ways both intended and unforeseen, the printing press democratized knowledge and permanently altered the relationship between information, power, and society.',
    questions: [
      { question: 'What is the central argument of this passage?', options: ['Gutenberg was the most important inventor in human history', 'The printing press democratized knowledge and transformed society in profound ways', 'Books were too expensive before the printing press', 'The Catholic Church was weakened by the printing press'], correct: 1, explanation: 'The passage argues that the printing press had sweeping effects on literacy, religion, science, and the relationship between information and power.' },
      { question: 'Before the printing press, why were books so rare?', options: ['Paper had not yet been invented in Europe', 'The church banned the ownership of books by common people', 'Hand-copying was so labor-intensive that books were extremely expensive', 'There was little demand for books in medieval Europe'], correct: 2, explanation: 'The passage states that scribes spent months copying single manuscripts, making books expensive enough that only wealthy institutions and individuals could own them.' },
      { question: 'The passage suggests that the Reformation spread rapidly because:', options: ['Luther was a uniquely persuasive public speaker', 'The printing press allowed his ideas to spread faster than opposition could suppress them', 'The Catholic Church was already weakened before Luther', 'European monarchs supported Luther\'s theological arguments'], correct: 1, explanation: 'The passage states the Reformation "accelerated partly because Martin Luther\'s ideas could be printed and distributed across the continent faster than the Catholic Church could respond or suppress them."' },
      { question: 'As used in the passage, "democratized" most nearly means:', options: ['Made subject to voting and popular elections', 'Made available to a much broader range of people', 'Transferred from religious to government control', 'Simplified so that anyone could understand'], correct: 1, explanation: 'In context, "democratized knowledge" means making knowledge accessible to a broader population, not just elites — consistent with the passage\'s description of wider literacy and book ownership.' },
      { question: 'What does the phrase "both intended and unforeseen" suggest about the printing press?', options: ['Gutenberg planned every consequence of his invention', 'Some effects were anticipated but others emerged in ways Gutenberg could not have predicted', 'All effects of the printing press were negative surprises', 'Historians disagree about Gutenberg\'s original intentions'], correct: 1, explanation: 'This phrase, combined with the opening sentence about Gutenberg not anticipating the full scale of his invention, suggests some effects were planned while others were unexpected.' },
    ],
  },
  {
    id: 5,
    domain: 'D2',
    difficulty: 'Hard',
    title: 'Cultural Appropriation',
    text: 'The debate over cultural appropriation has grown increasingly prominent in public discourse, yet it remains poorly defined and inconsistently applied. At its most defensible, the concept identifies a real harm: when members of a historically dominant culture adopt elements of a marginalized culture — sacred objects, traditional garments, spiritual practices — without understanding, permission, or acknowledgment, they can trivialize traditions that carry deep significance for communities that have often suffered for maintaining them. The adoption of Native American headdresses as costume accessories, for instance, reduces ceremonial objects of profound meaning to fashion statements.\n\nCritics of the concept argue that culture has never been static or neatly bounded. Throughout history, artistic traditions, musical forms, linguistic patterns, and culinary techniques have crossed ethnic and national lines through trade, migration, conquest, and ordinary human contact. To police these exchanges based on the ethnic identity of participants, they argue, is both impractical and contrary to a cosmopolitan vision in which ideas and art belong to all humanity. A more nuanced position holds that context and power matter more than the act of borrowing itself: the same adoption of a cultural element might be respectful in one context and exploitative in another, depending on whether it involves genuine engagement, misrepresentation, or commercial extraction without benefit to the source community.',
    questions: [
      { question: 'What does the passage identify as the most defensible concern about cultural appropriation?', options: ['All cultural exchange between different groups is harmful', 'Dominant cultures trivializing meaningful traditions of marginalized communities without understanding', 'Artistic traditions should remain within their cultures of origin', 'Fashion companies profit too much from cultural elements'], correct: 1, explanation: 'The passage states the concept "identifies a real harm" when dominant cultures adopt marginalized elements without understanding, trivializing traditions communities have suffered to maintain.' },
      { question: 'What is the main argument of those who criticize the concept of cultural appropriation?', options: ['Marginalized cultures should be grateful for wider exposure', 'Culture has always crossed boundaries and restricting exchange by ethnicity contradicts cosmopolitan values', 'Only governments should regulate cultural exchange', 'Historical injustices are irrelevant to modern cultural debates'], correct: 1, explanation: 'Critics argue culture has never been static, has always crossed lines, and that policing exchange by ethnic identity is contrary to cosmopolitan values.' },
      { question: 'The "more nuanced position" described in the final sentence argues that:', options: ['Cultural appropriation is always wrong regardless of context', 'The appropriateness of cultural borrowing depends on context, power, and whether it involves genuine engagement', 'Only members of marginalized groups can judge what counts as appropriation', 'Cultural borrowing should require formal legal agreements'], correct: 1, explanation: 'The nuanced position holds that context and power matter more than the act of borrowing — the same adoption can be respectful or exploitative depending on how it is done.' },
      { question: 'The author\'s primary purpose in this passage is to:', options: ['Argue definitively that cultural appropriation is harmful and should be stopped', 'Present multiple perspectives on a contested concept while identifying its strongest form', 'Dismiss the concept of cultural appropriation as politically motivated', 'Celebrate the cosmopolitan mixing of world cultures'], correct: 1, explanation: 'The author presents the strongest version of the appropriation argument, the critics\' response, and a more nuanced synthesis — suggesting the goal is to map the debate rather than resolve it.' },
      { question: 'As used in the passage, "cosmopolitan" most nearly means:', options: ['Urban and sophisticated in lifestyle', 'Belonging to or inclusive of all of humanity regardless of national origin', 'Relating to the fashion and beauty industry', 'Skeptical of traditional cultural practices'], correct: 1, explanation: 'In context, "cosmopolitan vision" refers to the idea that art and ideas belong to all humanity — a worldview that transcends national or ethnic boundaries.' },
    ],
  },
  {
    id: 6,
    domain: 'D2',
    difficulty: 'Easy',
    title: 'Sleep and the Brain',
    text: 'Scientists once believed that the brain was essentially inactive during sleep, resting while the body repaired itself. Decades of research have overturned this assumption entirely. During sleep, the brain is engaged in an array of critical functions: consolidating memories from the day, clearing metabolic waste products through the recently discovered glymphatic system, regulating emotional processing, and performing maintenance on neural connections.\n\nThe consequences of disrupting these processes are severe. Studies have shown that going without sleep for seventeen to nineteen hours produces cognitive impairment equivalent to a blood alcohol level of 0.05 percent — the legal limit for driving in many countries. Chronic sleep deprivation has been linked to increased risk of Alzheimer\'s disease, cardiovascular disease, obesity, and depression. Yet surveys consistently show that a large proportion of adults in industrialized societies sleep fewer than the recommended seven to nine hours per night, often by choice rather than necessity. Sleep researchers argue that this represents a significant public health crisis that receives far less attention than its scale warrants.',
    questions: [
      { question: 'What is the main idea of this passage?', options: ['The brain is inactive during sleep', 'Sleep is critical for brain function, and widespread sleep deprivation is a serious public health problem', 'Adults should sleep exactly eight hours every night', 'Alzheimer\'s disease is primarily caused by lack of sleep'], correct: 1, explanation: 'The passage establishes that sleep involves critical brain functions and then argues that widespread deprivation of it represents a major public health crisis.' },
      { question: 'What was the previous scientific view of sleep, according to the passage?', options: ['Sleep was considered essential for brain development', 'The brain was thought to be essentially inactive during sleep', 'Scientists believed sleep was unnecessary for healthy adults', 'Sleep was considered primarily a social and cultural ritual'], correct: 1, explanation: 'The passage opens by stating scientists once believed the brain was "essentially inactive during sleep, resting while the body repaired itself."' },
      { question: 'According to the passage, what does the glymphatic system do during sleep?', options: ['Consolidates memories from the previous day', 'Clears metabolic waste products from the brain', 'Regulates emotional processing and mood', 'Repairs damaged neural connections'], correct: 1, explanation: 'The passage lists clearing metabolic waste through the glymphatic system as one of the critical functions the brain performs during sleep.' },
      { question: 'The comparison to a blood alcohol level of 0.05% is used to:', options: ['Argue that sleep deprivation should be treated as a crime', 'Provide a familiar benchmark that illustrates how severely sleep loss impairs cognition', 'Suggest that alcohol and sleep deprivation have identical effects on the brain', 'Show that legal limits on drinking are too strict'], correct: 1, explanation: 'The comparison gives readers a concrete, relatable reference point for understanding the severity of cognitive impairment caused by sleep deprivation.' },
      { question: 'The passage implies that widespread sleep deprivation is particularly troubling because:', options: ['It is caused by factors entirely outside individuals\' control', 'Many people choose to sleep less than recommended despite the known health consequences', 'Sleep researchers have no effective solutions to propose', 'The health consequences only appear after many years'], correct: 1, explanation: 'The passage states that adults sleep fewer than recommended "often by choice rather than necessity," making the widespread deprivation a matter of preventable behavior.' },
    ],
  },
  {
    id: 7,
    domain: 'D2',
    difficulty: 'Medium',
    title: 'The Gut-Brain Connection',
    text: 'The idea that the gut and brain communicate is not new — people have long spoken of "gut feelings" and "butterflies in the stomach." What is new is the scientific understanding of how extensive and bidirectional this communication actually is. The gut contains its own nervous system, the enteric nervous system, which comprises roughly 500 million neurons — more than the spinal cord. This system communicates with the brain via the vagus nerve and through the release of neurotransmitters, including serotonin, of which approximately 90 percent is produced in the gut rather than the brain.\n\nThis research has upended assumptions about mental health treatment. If gut bacteria influence serotonin production, and serotonin influences mood, then the composition of an individual\'s microbiome may contribute to their mental health in ways that were previously unrecognized. Studies have found correlations between disrupted microbiomes and conditions including depression, anxiety, and autism spectrum disorder, though causation remains difficult to establish. Researchers are exploring whether interventions such as dietary changes, probiotics, or fecal microbiota transplants could supplement or even replace traditional psychiatric treatments. The field remains young and its claims sometimes outpace its evidence, but the gut-brain axis represents one of the most exciting frontiers in modern medicine.',
    questions: [
      { question: 'What is the main purpose of this passage?', options: ['To argue that gut bacteria cause all mental illness', 'To explain the science of gut-brain communication and its implications for mental health', 'To promote probiotics as a replacement for psychiatric medication', 'To describe the anatomy of the digestive system'], correct: 1, explanation: 'The passage explains how the gut and brain communicate and discusses what this means for understanding and potentially treating mental health conditions.' },
      { question: 'What is surprising about serotonin according to the passage?', options: ['It is produced only in the brain', 'Approximately 90 percent of it is produced in the gut, not the brain', 'It has no connection to mood or mental health', 'It is found only in people without mental illness'], correct: 1, explanation: 'The passage notes that approximately 90 percent of serotonin is produced in the gut, which is surprising given that serotonin is widely known as a brain chemical linked to mood.' },
      { question: 'Why does the passage say causation is "difficult to establish" between microbiome disruption and mental illness?', options: ['The studies have not been conducted yet', 'Correlations exist but it is unclear whether microbiome changes cause mental illness or result from it', 'Researchers believe the relationship is purely coincidental', 'Mental illness has been proven to have only genetic causes'], correct: 1, explanation: 'The passage acknowledges correlations between disrupted microbiomes and mental health conditions but notes causation is hard to establish — a standard scientific caution about correlational data.' },
      { question: 'The phrase "its claims sometimes outpace its evidence" suggests that:', options: ['Gut-brain research is fraudulent', 'Some assertions in this field go further than the current data can fully support', 'The field has already been discredited by mainstream science', 'Researchers are deliberately misleading the public'], correct: 1, explanation: 'This phrase acknowledges that while the field is promising, enthusiasm has sometimes led to claims that exceed what the evidence currently supports — a note of scientific caution.' },
      { question: 'According to the passage, what makes the enteric nervous system remarkable?', options: ['It is completely independent from the brain and never communicates with it', 'It contains roughly 500 million neurons — more than the spinal cord', 'It is the primary source of all human emotions', 'It was only discovered within the last decade'], correct: 1, explanation: 'The passage describes the enteric nervous system as containing roughly 500 million neurons, more than the spinal cord, which establishes its remarkable size and complexity.' },
    ],
  },
  {
    id: 8,
    domain: 'D2',
    difficulty: 'Medium',
    title: 'Coral Reefs Under Threat',
    text: 'Coral reefs occupy less than one percent of the ocean floor yet support an estimated twenty-five percent of all marine species, earning them the nickname "rainforests of the sea." This extraordinary productivity arises from a symbiotic relationship at the reef\'s foundation: tiny coral polyps provide shelter and carbon dioxide to photosynthetic algae called zooxanthellae, which in turn supply the corals with up to ninety percent of their energy through photosynthesis.\n\nThis partnership is fragile. When ocean temperatures rise even one to two degrees Celsius above normal seasonal maximums, corals expel their zooxanthellae in a stress response called bleaching. Without their algae, corals lose both their color and their primary energy source. If temperatures return to normal quickly, corals can recover; if the stress persists, they die. The Great Barrier Reef experienced mass bleaching events in 2016, 2017, 2020, and 2022 — four events in seven years, compared to none recorded before 1998. Scientists attribute this acceleration to rising ocean temperatures caused by climate change. Without significant reductions in greenhouse gas emissions, models project that virtually all coral reefs will experience annual bleaching by mid-century, leaving insufficient time for recovery between events.',
    questions: [
      { question: 'What is the primary threat to coral reefs described in this passage?', options: ['Overfishing of species that protect the reefs', 'Rising ocean temperatures causing repeated bleaching events', 'Ocean acidification dissolving coral structures', 'Pollution from coastal development'], correct: 1, explanation: 'The passage focuses on bleaching caused by elevated ocean temperatures as the primary threat, linking the acceleration of bleaching events to climate change.' },
      { question: 'What is the relationship between coral polyps and zooxanthellae?', options: ['Zooxanthellae are parasites that weaken coral structures', 'A symbiotic relationship in which each organism benefits from the other', 'Coral polyps consume zooxanthellae as their primary food source', 'Zooxanthellae compete with corals for space on the reef'], correct: 1, explanation: 'The passage describes a symbiotic relationship: polyps provide shelter and carbon dioxide to the algae, which supply up to 90% of the coral\'s energy.' },
      { question: 'According to the passage, what happens during coral bleaching?', options: ['Corals produce extra pigment to protect against sunlight', 'Corals expel their zooxanthellae, losing color and their main energy source', 'Coral skeletons dissolve in warming water', 'Corals release toxins to defend against predators'], correct: 1, explanation: 'The passage states that bleaching occurs when corals expel zooxanthellae as a stress response, losing both color and primary energy source.' },
      { question: 'Why is the frequency of bleaching events since 2016 significant?', options: ['It shows that coral reefs are becoming more resilient over time', 'Four events in seven years compared to none before 1998 suggests a dramatic and dangerous acceleration', 'It proves that bleaching is a natural cycle unrelated to human activity', 'It indicates that the Great Barrier Reef is recovering from earlier damage'], correct: 1, explanation: 'The comparison — four bleaching events in seven years versus none before 1998 — illustrates a dramatic acceleration that the passage attributes to climate change.' },
      { question: 'What does the passage predict will happen if greenhouse gas emissions are not significantly reduced?', options: ['Coral reefs will adapt to warmer temperatures over time', 'Annual bleaching by mid-century will leave reefs no time to recover between events', 'Ocean temperatures will stabilize at current levels', 'Zooxanthellae will evolve to survive at higher temperatures'], correct: 1, explanation: 'The passage states models project virtually all reefs will experience annual bleaching by mid-century without emissions reductions, leaving no recovery time.' },
    ],
  },
  {
    id: 9,
    domain: 'D2',
    difficulty: 'Hard',
    title: 'Artificial Intelligence and Labor',
    text: 'The question of whether automation will ultimately create more jobs than it destroys has divided economists for decades, and the emergence of powerful artificial intelligence systems has intensified that debate. Optimists point to historical precedent: the mechanization of agriculture in the nineteenth century and the automation of manufacturing in the twentieth displaced millions of workers but ultimately generated new industries and occupations that employed far more people than were displaced. They argue that AI will follow the same pattern, freeing humans from routine cognitive tasks and creating demand for roles requiring creativity, empathy, and complex judgment.\n\nSkeptics question whether this time is different. Previous waves of automation largely replaced physical and routine cognitive labor while leaving non-routine cognitive work — the province of educated professionals — relatively untouched. Modern AI systems, by contrast, are encroaching on tasks once considered the exclusive domain of human expertise: legal research, medical diagnosis, financial analysis, and even creative writing and software development. If automation can now substitute for skilled professional labor as well as routine tasks, the historical analogy may be misleading, and the transition costs — measured in displaced careers, reduced wages, and concentrated corporate power — could be severe and prolonged.',
    questions: [
      { question: 'What is the central debate described in this passage?', options: ['Whether artificial intelligence is more dangerous than nuclear weapons', 'Whether automation will ultimately create more jobs than it eliminates', 'Whether governments should regulate technology companies', 'Whether humans or machines are more creative'], correct: 1, explanation: 'The passage frames the debate around whether AI, like previous automation waves, will ultimately create more jobs than it destroys.' },
      { question: 'What historical evidence do optimists use to support their position?', options: ['Ancient civilizations thrived by automating agricultural work', 'Mechanization and manufacturing automation displaced workers but ultimately created more jobs', 'AI has already created millions of new jobs in technology sectors', 'Workers who lost jobs to automation found better-paying replacements'], correct: 1, explanation: 'Optimists cite the mechanization of agriculture and manufacturing automation as precedents showing that displacement leads to new industries employing more workers.' },
      { question: 'According to skeptics, what makes current AI different from previous automation waves?', options: ['AI operates faster than previous automated systems', 'Previous automation left skilled professional work intact, but AI now threatens that domain too', 'AI is controlled by fewer companies than previous technologies', 'Current AI is more expensive to implement than earlier automation'], correct: 1, explanation: 'Skeptics argue that previous automation left non-routine cognitive work untouched, while modern AI encroaches on skilled professional domains like law, medicine, and software development.' },
      { question: 'As used in the passage, "encroaching" most nearly means:', options: ['Improving', 'Retreating from', 'Gradually intruding into', 'Being excluded from'], correct: 2, explanation: 'In context, AI systems are described as "encroaching on tasks once considered the exclusive domain of human expertise" — meaning gradually moving into territory they previously did not occupy.' },
      { question: 'The passage\'s structure can best be described as:', options: ['A chronological history of automation from the industrial revolution to today', 'A presentation of an optimistic view followed by a skeptical counterargument', 'A one-sided argument that AI will destroy employment', 'A series of unrelated observations about technology and labor'], correct: 1, explanation: 'The passage presents the optimists\' argument in the first paragraph and the skeptics\' counterargument in the second, following a classic compare-and-contrast structure.' },
    ],
  },
  {
    id: 10,
    domain: 'D2',
    difficulty: 'Medium',
    title: 'The Microbiome and Health',
    text: 'The human body harbors approximately 38 trillion microbial cells — bacteria, viruses, fungi, and other organisms — that together constitute the microbiome. For most of medical history, these organisms were viewed primarily as potential pathogens to be controlled or eliminated. The development of advanced genomic sequencing techniques in the early twenty-first century transformed this picture, allowing scientists to catalogue the extraordinary diversity of microbial life within healthy human bodies and to begin understanding their functions.\n\nWhat researchers have found is striking: the microbiome is not merely a passenger but an active participant in human physiology. Gut bacteria assist in digesting food, synthesizing vitamins, and training the immune system to distinguish harmless substances from genuine threats. Disruptions to the microbiome — through antibiotic use, dietary changes, or other factors — have been associated with a widening range of conditions including inflammatory bowel disease, allergies, type 2 diabetes, and even mental health disorders. The implications for medicine are significant. Rather than viewing health as the absence of microbes, scientists increasingly understand it as depending on maintaining a complex, dynamic balance among trillions of organisms whose relationships we are only beginning to map.',
    questions: [
      { question: 'How has the scientific view of the microbiome changed according to the passage?', options: ['Microbes are now considered more dangerous than previously thought', 'Microbes were once seen mainly as pathogens but are now understood as active contributors to health', 'Scientists now believe the microbiome should be eliminated for better health', 'Research has confirmed that most microbes have no effect on human health'], correct: 1, explanation: 'The passage describes a shift from viewing microbes primarily as potential pathogens to understanding them as active participants in human physiology.' },
      { question: 'What role do gut bacteria play according to the passage?', options: ['They primarily cause digestive diseases', 'They assist digestion, synthesize vitamins, and train the immune system', 'They compete with human cells for nutrients', 'They have no significant function in healthy individuals'], correct: 1, explanation: 'The passage lists gut bacteria\'s roles as assisting digestion, synthesizing vitamins, and training the immune system.' },
      { question: 'What enabled the transformation in scientific understanding of the microbiome?', options: ['The discovery of antibiotics in the twentieth century', 'Advanced genomic sequencing techniques developed in the early twenty-first century', 'New microscopes that could visualize individual bacteria', 'Large-scale clinical trials comparing healthy and sick patients'], correct: 1, explanation: 'The passage states that advanced genomic sequencing "transformed this picture, allowing scientists to catalogue the extraordinary diversity of microbial life within healthy human bodies."' },
      { question: 'The phrase "only beginning to map" in the final sentence suggests that:', options: ['Scientists have no useful knowledge about the microbiome yet', 'The scientific understanding of microbial relationships is still in early stages', 'Mapping technology is insufficient for microbiome research', 'The microbiome is too simple to require extensive study'], correct: 1, explanation: 'This phrase conveys that despite significant progress, scientific understanding of the complex relationships within the microbiome remains in its early stages.' },
      { question: 'What is the main idea of the final paragraph?', options: ['Antibiotics should be avoided because they disrupt the microbiome', 'The microbiome plays active roles in health, and disrupting it is associated with various diseases', 'Type 2 diabetes is caused entirely by microbiome disruption', 'Human cells are less important than microbial cells for maintaining health'], correct: 1, explanation: 'The final paragraph establishes that the microbiome actively participates in health and that disruptions are associated with a range of conditions — making it the most substantive paragraph in the passage.' },
    ],
  },
  {
  id: 11,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'Volcano Formation',
  text: 'Volcanoes form when molten rock from deep beneath the Earth’s crust rises toward the surface through cracks or weak points in the rock layers. This molten material, called magma, can erupt violently or gently depending on pressure, gas content, and the surrounding geology. When magma reaches the surface, it is called lava, and it cools to form solid rock. Over repeated eruptions, layers of hardened lava and ash build up over time, gradually forming the structure of a volcano.\n\nMost volcanoes are located near tectonic plate boundaries, where sections of the Earth’s crust move, collide, or separate. These zones create pathways that allow magma to escape more easily. Volcanic eruptions can destroy landscapes and human settlements, but they also create new landforms such as islands and fertile soil. In addition, eruptions can release ash and gases into the atmosphere, sometimes affecting global temperatures for short periods.',
  questions: [
    { question: 'What is magma?', options: ['Solid rock underground', 'Molten rock beneath Earth’s crust', 'Frozen lava', 'Ocean sediment'], correct: 1, explanation: 'Magma is molten rock below the surface.' },
    { question: 'What forms after lava cools?', options: ['Gas clouds', 'Solid rock layers', 'Water', 'Sand dunes'], correct: 1, explanation: 'Lava cools into rock.' },
    { question: 'Where do most volcanoes form?', options: ['Deserts', 'Plate boundaries', 'Polar ice sheets', 'Open oceans far from plates'], correct: 1, explanation: 'They form at plate boundaries.' },
    { question: 'What is one effect of eruptions?', options: ['Only destruction', 'Creation of new landforms', 'Stopping weather', 'Eliminating gravity'], correct: 1, explanation: 'They can create islands and land.' },
    { question: 'Main idea?', options: ['Volcanoes are random explosions', 'How volcanoes form and affect Earth', 'Earth has no internal heat', 'Weather causes eruptions'], correct: 1, explanation: 'Explains formation and impact.' },
  ],
},
{
  id: 12,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'Photosynthesis and Energy Flow',
  text: 'Photosynthesis is the process by which green plants produce their own food using sunlight. Plants absorb carbon dioxide from the air and water from the soil through their roots. Inside the leaves, chlorophyll captures sunlight and uses its energy to convert these raw materials into glucose, a type of sugar that stores energy. Oxygen is released as a byproduct of this chemical reaction.\n\nThis process takes place mainly in the chloroplasts of plant cells and is essential for life on Earth. It not only provides energy for plants themselves but also supports nearly all food chains, since animals either directly or indirectly rely on plants for food. Without photosynthesis, oxygen levels in the atmosphere would decrease over time, and most life forms would not survive.',
  questions: [
    { question: 'What is the main purpose of photosynthesis?', options: ['To produce oxygen only', 'To allow plants to make food using sunlight', 'To heat the soil', 'To move plants'], correct: 1, explanation: 'It produces glucose using sunlight.' },
    { question: 'What gas do plants absorb?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen only', 'Helium'], correct: 1, explanation: 'Plants absorb CO2.' },
    { question: 'What does chlorophyll do?', options: ['Stores water', 'Captures sunlight', 'Produces soil', 'Breaks roots'], correct: 1, explanation: 'It captures light energy.' },
    { question: 'Why is photosynthesis important?', options: ['It removes all animals', 'It supports food chains and oxygen production', 'It stops weather', 'It cools the Earth completely'], correct: 1, explanation: 'It supports life systems.' },
    { question: 'Main idea?', options: ['Plants do not need energy', 'How plants convert sunlight into food', 'Rocks create oxygen', 'Animals make plants'], correct: 1, explanation: 'Explains energy conversion.' },
  ],
},
{
  id: 13,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Earthquakes and Seismic Activity',
  text: 'Earthquakes occur when stress builds up along faults in the Earth’s crust and is suddenly released in the form of energy. This release generates seismic waves that travel through the ground and cause the shaking that is felt on the surface. The point beneath the Earth where the earthquake begins is called the focus, while the point directly above it on the surface is called the epicenter.\n\nEarthquakes vary greatly in strength. Some are so weak they are barely noticeable, while others are powerful enough to destroy buildings, roads, and entire cities. Most earthquakes occur along tectonic plate boundaries, where massive slabs of the Earth’s crust are constantly moving, colliding, or sliding past one another. The study of earthquakes helps scientists better understand how the Earth’s interior behaves and how to reduce risks to human populations.',
  questions: [
    { question: 'What causes earthquakes?', options: ['Wind pressure', 'Sudden release of stress along faults', 'Ocean tides', 'Cloud movement'], correct: 1, explanation: 'Stress release causes quakes.' },
    { question: 'What are seismic waves?', options: ['Light waves', 'Energy waves traveling through Earth', 'Sound in air only', 'Water currents'], correct: 1, explanation: 'They travel through ground.' },
    { question: 'What is the epicenter?', options: ['Deep underground origin', 'Surface point above focus', 'Ocean floor', 'Sky region'], correct: 1, explanation: 'Surface location above focus.' },
    { question: 'Where do most earthquakes occur?', options: ['Random locations', 'Tectonic plate boundaries', 'Cloud systems', 'Deep space'], correct: 1, explanation: 'At plate boundaries.' },
    { question: 'Main idea?', options: ['Earth is static', 'How earthquakes form and vary in strength', 'Weather creates earthquakes', 'Oceans prevent earthquakes'], correct: 1, explanation: 'Explains causes and effects.' },
  ],
},
{
  id: 14,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'The Water Cycle and Climate System',
  text: 'The water cycle describes the continuous movement of water on, above, and below the Earth’s surface. It begins with evaporation, when heat from the sun causes water in oceans, rivers, and lakes to turn into water vapor. This vapor rises into the atmosphere and cools, forming clouds through condensation. When the droplets in clouds become heavy enough, they fall back to Earth as precipitation in the form of rain, snow, or hail.\n\nOnce water reaches the ground, it either collects in bodies of water, seeps into the soil, or flows across the surface as runoff, eventually returning to oceans and lakes. This cycle is essential for distributing freshwater across the planet and maintaining ecosystems. Without it, many regions would become uninhabitable due to lack of accessible water.',
  questions: [
    { question: 'What starts evaporation?', options: ['Wind', 'Sun heat', 'Gravity', 'Snow'], correct: 1, explanation: 'Sun provides energy.' },
    { question: 'What is condensation?', options: ['Water freezing instantly', 'Vapor forming clouds', 'Rain falling', 'Soil drying'], correct: 1, explanation: 'Cloud formation process.' },
    { question: 'What is precipitation?', options: ['Cloud creation', 'Water falling to Earth', 'Heat energy', 'Air movement'], correct: 1, explanation: 'Rain, snow, hail.' },
    { question: 'What happens after water falls?', options: ['It disappears', 'It collects or flows back to oceans', 'It becomes gas immediately', 'It turns into rock'], correct: 1, explanation: 'Returns to water sources.' },
    { question: 'Main idea?', options: ['Water is static', 'How water continuously circulates on Earth', 'Rocks create rain', 'Air stops water flow'], correct: 1, explanation: 'Describes cycle.' },
  ],
},
{
  id: 15,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Ecosystem Stability and Food Chains',
  text: 'An ecosystem is a network of living organisms interacting with each other and with their physical environment. Within every ecosystem, energy flows through food chains and food webs, beginning with producers such as plants that convert sunlight into energy through photosynthesis. Consumers then obtain energy by eating plants or other animals, while decomposers break down dead organisms and recycle nutrients back into the soil.\n\nThe stability of an ecosystem depends on balance between these groups. If one species is removed or introduced, it can trigger a chain reaction affecting many others. For example, the removal of a top predator can cause an explosion in herbivore populations, which may overconsume vegetation and disrupt the entire system. Scientists study these interactions to understand biodiversity and predict how ecosystems respond to environmental change.',
  questions: [
    { question: 'What are producers?', options: ['Animals that hunt', 'Organisms that create energy from sunlight', 'Dead organisms', 'Water sources'], correct: 1, explanation: 'They produce energy.' },
    { question: 'What do decomposers do?', options: ['Create sunlight', 'Break down dead matter', 'Hunt prey', 'Control weather'], correct: 1, explanation: 'They recycle nutrients.' },
    { question: 'What happens if a predator is removed?', options: ['Ecosystem becomes identical', 'Herbivores may increase too much', 'Plants stop growing forever', 'Energy disappears'], correct: 1, explanation: 'Population imbalance occurs.' },
    { question: 'What is an ecosystem?', options: ['Single organism', 'Interacting organisms and environment', 'Weather system', 'Ocean only'], correct: 1, explanation: 'Living + nonliving system.' },
    { question: 'Main idea?', options: ['Ecosystems are random', 'Balance is essential in ecosystems', 'Only animals matter', 'Food chains do not exist'], correct: 1, explanation: 'Focus on stability.' },
  ],
},
{
  id: 16,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'The Solar System',
  text: 'The solar system consists of the Sun and all objects that are bound to it by gravity. This includes eight planets, their moons, dwarf planets such as Pluto, and countless smaller objects like asteroids and comets. The Sun is the central star and contains more than 99 percent of the total mass of the solar system, making its gravitational pull the dominant force that keeps all other objects in orbit.\n\nEach planet follows a specific path called an orbit, which is determined by the balance between gravitational pull and forward motion. Inner planets like Mercury, Venus, Earth, and Mars are rocky and dense, while outer planets such as Jupiter and Saturn are gas giants composed mostly of hydrogen and helium. Studying the solar system helps scientists understand how planetary systems form and evolve over time.',
  questions: [
    { question: 'What holds the solar system together?', options: ['Magnetism', 'Gravity from the Sun', 'Wind', 'Light energy'], correct: 1, explanation: 'The Sun’s gravity binds the system.' },
    { question: 'What is an orbit?', options: ['A planet explosion', 'Path around a star', 'A type of moon', 'A comet tail'], correct: 1, explanation: 'Planets move in paths called orbits.' },
    { question: 'Which planets are rocky?', options: ['Outer planets', 'Inner planets', 'Gas giants only', 'Dwarf planets only'], correct: 1, explanation: 'Mercury to Mars are rocky.' },
    { question: 'What is the Sun mainly responsible for?', options: ['Creating oceans', 'Gravitational control of the system', 'Producing moons', 'Stopping asteroids'], correct: 1, explanation: 'It dominates gravity.' },
    { question: 'Main idea?', options: ['Only Earth exists', 'Structure and components of the solar system', 'Stars are planets', 'Gravity does not exist'], correct: 1, explanation: 'Explains solar system structure.' },
  ],
},
{
  id: 17,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'The Human Respiratory System',
  text: 'The human respiratory system is responsible for bringing oxygen into the body and removing carbon dioxide. Air enters through the nose or mouth and travels down the trachea into the lungs. Inside the lungs, oxygen passes into the bloodstream through tiny air sacs called alveoli, while carbon dioxide is removed from the blood and exhaled.\n\nThe diaphragm, a large muscle beneath the lungs, plays a key role in breathing. When it contracts, the lungs expand and draw in air. When it relaxes, air is pushed out. This continuous process ensures that cells throughout the body receive the oxygen they need to produce energy.',
  questions: [
    { question: 'What is the main function of the respiratory system?', options: ['Digestion', 'Gas exchange', 'Blood production', 'Bone growth'], correct: 1, explanation: 'It exchanges oxygen and carbon dioxide.' },
    { question: 'Where does oxygen enter the blood?', options: ['Trachea', 'Alveoli', 'Heart', 'Stomach'], correct: 1, explanation: 'Gas exchange happens in alveoli.' },
    { question: 'What does the diaphragm do?', options: ['Pumps blood', 'Controls breathing', 'Digests food', 'Stores oxygen'], correct: 1, explanation: 'It controls lung movement.' },
    { question: 'What gas is removed from the body?', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], correct: 1, explanation: 'CO2 is exhaled.' },
    { question: 'Main idea?', options: ['Breathing is unnecessary', 'How humans breathe and exchange gases', 'Bones control breathing', 'Food creates oxygen'], correct: 1, explanation: 'Explains respiration.' },
  ],
},
{
  id: 18,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Plate Tectonics',
  text: 'The theory of plate tectonics explains that Earth’s outer shell is divided into large sections called tectonic plates. These plates float on the semi-molten mantle beneath them and move very slowly over time. Their movement is driven by heat from the Earth’s interior, which creates convection currents in the mantle.\n\nWhen plates collide, separate, or slide past one another, they can create mountains, earthquakes, and volcanic activity. For example, the Himalayas formed when two continental plates collided. This ongoing movement means that Earth’s surface is constantly changing, even though the process is too slow to observe directly in daily life.',
  questions: [
    { question: 'What are tectonic plates?', options: ['Ocean waves', 'Large sections of Earth’s crust', 'Cloud layers', 'Rocks in rivers'], correct: 1, explanation: 'They are crust sections.' },
    { question: 'What drives plate movement?', options: ['Wind', 'Heat in Earth’s interior', 'Moon gravity only', 'Ocean tides'], correct: 1, explanation: 'Convection currents move plates.' },
    { question: 'What can plate collisions form?', options: ['Rainbows', 'Mountains', 'Clouds', 'Stars'], correct: 1, explanation: 'They form mountains like Himalayas.' },
    { question: 'Why is movement hard to notice?', options: ['It does not exist', 'It is extremely slow', 'It happens in space', 'It stops at night'], correct: 1, explanation: 'Movement is gradual.' },
    { question: 'Main idea?', options: ['Earth is static', 'How tectonic plates shape Earth', 'Weather moves plates', 'Rivers create plates'], correct: 1, explanation: 'Explains plate tectonics.' },
  ],
},
{
  id: 19,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Genetics and DNA',
  text: 'DNA, or deoxyribonucleic acid, is the molecule that carries genetic instructions in living organisms. It is found in nearly every cell and contains the information needed for growth, development, and reproduction. DNA is structured as a double helix made up of four chemical bases that pair in specific ways.\n\nGenes are segments of DNA that determine specific traits, such as eye color or height. When cells divide, DNA is copied so that genetic information is passed on accurately. Mutations, or changes in DNA, can sometimes lead to differences in traits or genetic disorders.',
  questions: [
    { question: 'What is DNA?', options: ['A type of cell', 'Genetic material', 'A bone structure', 'A hormone'], correct: 1, explanation: 'DNA carries genetic info.' },
    { question: 'What are genes?', options: ['Cells', 'Segments of DNA', 'Organs', 'Proteins only'], correct: 1, explanation: 'Genes are DNA sections.' },
    { question: 'What is a mutation?', options: ['Cell death', 'Change in DNA', 'New organ', 'Blood type'], correct: 1, explanation: 'DNA alteration.' },
    { question: 'What shape is DNA?', options: ['Square', 'Double helix', 'Triangle', 'Flat sheet'], correct: 1, explanation: 'Twisted ladder shape.' },
    { question: 'Main idea?', options: ['DNA is unimportant', 'How DNA stores genetic information', 'Cells do not divide', 'Genes control weather'], correct: 1, explanation: 'Explains genetics.' },
  ],
},
{
  id: 20,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Climate Systems and Feedback Loops',
  text: 'Earth’s climate system is influenced by complex interactions between the atmosphere, oceans, land surfaces, and ice. These components exchange energy and matter in ways that can either stabilize or amplify changes in temperature. One important concept in climate science is the feedback loop. A feedback loop occurs when a change in the system triggers effects that either reinforce or counteract the original change.\n\nFor example, when ice melts in polar regions, it reduces the Earth’s reflectivity, causing more sunlight to be absorbed and further warming the planet. This is known as a positive feedback loop. In contrast, increased cloud formation can sometimes reflect sunlight and reduce warming, acting as a negative feedback loop. Understanding these processes is essential for predicting future climate change, as small shifts can lead to large and sometimes unexpected global effects over time.',
  questions: [
    { question: 'What is a feedback loop?', options: ['A weather forecast', 'A system where changes affect themselves', 'A type of cloud', 'A mountain process'], correct: 1, explanation: 'Changes reinforce or reduce themselves.' },
    { question: 'What happens when ice melts?', options: ['Earth cools more', 'More heat is absorbed', 'Oceans disappear', 'Gravity increases'], correct: 1, explanation: 'Less reflection causes warming.' },
    { question: 'What is a positive feedback loop?', options: ['One that stops change', 'One that amplifies change', 'One that freezes Earth', 'One unrelated to climate'], correct: 1, explanation: 'It increases effects.' },
    { question: 'What can clouds do?', options: ['Increase gravity', 'Reflect sunlight', 'Create DNA', 'Stop oceans'], correct: 1, explanation: 'They reflect sunlight.' },
    { question: 'Main idea?', options: ['Climate is simple', 'How feedback loops affect climate systems', 'Weather controls DNA', 'Ice has no effect'], correct: 1, explanation: 'Explains climate feedbacks.' },
  ],
},
{
  id: 21,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'The Amazon Rainforest',
  text: 'The Amazon rainforest is one of the most important ecosystems on Earth. It covers a vast area in South America and is home to millions of species of plants, animals, and insects. Many of these species cannot be found anywhere else in the world, making the rainforest extremely valuable for biodiversity.\n\nThe Amazon also plays a critical role in regulating the Earth’s climate. Its trees absorb large amounts of carbon dioxide from the atmosphere, helping to reduce the effects of climate change. However, human activities such as logging, farming, and mining are destroying large parts of the forest each year.',
  questions: [
    { question: 'What is the main idea of the passage?', options: ['The Amazon is only useful for farming', 'The Amazon is a biodiverse ecosystem that helps regulate climate but is under threat', 'The Amazon has no environmental importance', 'The Amazon is a desert region'], correct: 1, explanation: 'It highlights biodiversity, climate role, and deforestation threats.' },
    { question: 'Why is the Amazon important for biodiversity?', options: ['It has very few species', 'It contains millions of unique species', 'It is completely man-made', 'It has no animals'], correct: 1, explanation: 'It contains millions of species, many found nowhere else.' },
    { question: 'How does the Amazon affect climate?', options: ['It increases global temperature', 'It absorbs carbon dioxide', 'It stops rainfall', 'It creates storms only'], correct: 1, explanation: 'Trees absorb CO₂ from the atmosphere.' },
    { question: 'What is one major threat to the Amazon?', options: ['Snowfall', 'Deforestation', 'Earthquakes', 'Ocean currents'], correct: 1, explanation: 'Logging, farming, and mining cause deforestation.' },
    { question: 'What is the tone of the passage?', options: ['Informative and concerned', 'Humorous', 'Angry', 'Completely neutral with no concern'], correct: 0, explanation: 'It is informative but highlights environmental concern.' }
  ]
},
{
  id: 22,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Cryptocurrency Systems',
  text: 'Cryptocurrencies are digital currencies that operate without a central authority such as a bank or government. They rely on blockchain technology, which is a secure and transparent system for recording transactions across a distributed network.\n\nBitcoin was the first major cryptocurrency and introduced the idea of decentralized finance. Supporters argue that cryptocurrencies increase financial independence and reduce reliance on traditional banking. However, critics point to price volatility, environmental concerns due to energy use, and potential misuse in illegal transactions.',
  questions: [
    { question: 'What is cryptocurrency?', options: ['Physical cash controlled by banks', 'Digital currency using decentralized systems', 'A type of credit card', 'Government-only money'], correct: 1, explanation: 'It is decentralized digital currency.' },
    { question: 'What technology supports cryptocurrency?', options: ['Bluetooth', 'Blockchain', 'Radio waves', 'Television signals'], correct: 1, explanation: 'Blockchain records transactions securely.' },
    { question: 'What is one benefit mentioned?', options: ['Guaranteed profits', 'Increased financial independence', 'No internet needed', 'No risks at all'], correct: 1, explanation: 'It increases financial independence.' },
    { question: 'What is one concern?', options: ['Too stable', 'Volatility and environmental impact', 'Too slow physically', 'No users exist'], correct: 1, explanation: 'Critics mention volatility and energy use.' },
    { question: 'What is the tone of the passage?', options: ['Balanced discussion', 'Strongly biased support', 'Humorous', 'Angry criticism'], correct: 0, explanation: 'It presents both advantages and disadvantages.' }
  ]
},
{
  id: 23,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Free Will and Determinism',
  text: 'The debate between free will and determinism has been central to philosophy for centuries. Determinists argue that every event, including human decisions, is the result of prior causes such as genetics, environment, and past experiences. From this view, all actions are ultimately predictable in principle.\n\nIn contrast, defenders of free will claim that humans possess genuine agency and can make choices independent of prior causes. Some philosophers propose compatibilism, the idea that free will and determinism can both be true if free will is defined as acting according to one’s internal motivations without external coercion.',
  questions: [
    { question: 'What is the central topic?', options: ['Science vs religion', 'Free will vs determinism', 'Language evolution', 'Physics laws'], correct: 1, explanation: 'It focuses on philosophical debate.' },
    { question: 'What do determinists believe?', options: ['Choices are random', 'All events are caused by prior factors', 'Humans are fully free', 'Nothing can be explained'], correct: 1, explanation: 'Determinism is causation-based.' },
    { question: 'What do free will advocates believe?', options: ['Humans have no control', 'Humans can make independent choices', 'Only machines decide', 'Everything is random'], correct: 1, explanation: 'They support agency.' },
    { question: 'What is compatibilism?', options: ['Rejection of causation', 'Free will and determinism can both be true', 'Belief in randomness only', 'Denial of philosophy'], correct: 1, explanation: 'It reconciles both ideas.' },
    { question: 'What is the tone?', options: ['Analytical and academic', 'Emotional', 'Humorous', 'Angry'], correct: 0, explanation: 'Neutral philosophical tone.' }
  ]
},
{
  id: 24,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'The Solar System',
  text: 'The solar system consists of the Sun and all objects that orbit it, including eight planets, moons, asteroids, and comets. The Sun is a massive star whose gravity keeps all these objects in orbit.\n\nEach planet in the solar system has unique characteristics such as size, atmosphere, and composition. Earth is the only known planet that supports life due to its conditions such as liquid water and a stable atmosphere.',
  questions: [
    { question: 'What is the solar system?', options: ['A galaxy cluster', 'The Sun and objects that orbit it', 'Only Earth and Moon', 'A group of stars only'], correct: 1, explanation: 'It includes Sun and orbiting bodies.' },
    { question: 'What holds the solar system together?', options: ['Magnetism', 'Gravity of the Sun', 'Wind', 'Water currents'], correct: 1, explanation: 'The Sun’s gravity holds it together.' },
    { question: 'How many planets are there?', options: ['6', '7', '8', '9'], correct: 2, explanation: 'There are eight planets.' },
    { question: 'Why is Earth unique?', options: ['It is the largest planet', 'It supports life', 'It has no atmosphere', 'It is closest to the Sun'], correct: 1, explanation: 'Earth supports life.' },
    { question: 'The passage is mainly about:', options: ['Weather systems', 'Structure of the solar system', 'Human biology', 'Ocean currents'], correct: 1, explanation: 'It explains the solar system.' }
  ]
},
{
  id: 25,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Artificial Intelligence in Education',
  text: 'Artificial intelligence is increasingly being used in education to personalize learning experiences. AI systems can analyze student performance data and adjust lessons based on individual strengths and weaknesses. This allows students to learn at their own pace and receive targeted support.\n\nHowever, concerns remain about data privacy, over-reliance on technology, and reduced human interaction in classrooms. Many educators believe AI should support teachers rather than replace them, preserving the importance of human guidance in learning.',
  questions: [
    { question: 'What is the main idea?', options: ['AI replaces all teachers', 'AI is used in education with benefits and concerns', 'Schools are no longer needed', 'Students only learn online'], correct: 1, explanation: 'Balanced view of AI in education.' },
    { question: 'What is one benefit of AI?', options: ['Removes learning', 'Personalized learning', 'Eliminates teachers', 'Stops testing'], correct: 1, explanation: 'AI adapts learning to students.' },
    { question: 'What is one concern?', options: ['Too many books', 'Privacy and reduced human interaction', 'Too much sunlight', 'No internet access'], correct: 1, explanation: 'Concerns include privacy and interaction.' },
    { question: 'What do educators believe?', options: ['AI should replace teachers', 'AI should support teachers', 'AI has no role', 'AI harms all learning'], correct: 1, explanation: 'AI is a support tool.' },
    { question: 'The tone is:', options: ['Balanced', 'Angry', 'Humorous', 'One-sided'], correct: 0, explanation: 'Neutral and balanced discussion.' }
  ]
},
{
  id: 26,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Ocean Plastic Pollution',
  text: 'Ocean plastic pollution has become a major environmental problem affecting marine ecosystems worldwide. Each year, millions of tons of plastic waste enter the oceans through rivers, coastlines, and human activity. Over time, larger pieces of plastic break down into microplastics, which are tiny fragments that spread throughout the water.\n\nMarine animals often mistake plastic for food, which can lead to injury, starvation, or death. These plastics also enter the food chain, eventually reaching humans. Efforts to reduce pollution include banning single-use plastics, improving recycling systems, and organizing ocean cleanup projects. Despite these efforts, the amount of plastic entering the oceans continues to increase.',
  questions: [
    { question: 'What is the main idea of the passage?', options: ['Oceans produce plastic naturally', 'Plastic pollution is a serious environmental issue affecting oceans', 'Plastic improves marine life', 'Oceans clean themselves automatically'], correct: 1, explanation: 'The passage focuses on pollution and its impact.' },
    { question: 'What are microplastics?', options: ['Large plastic objects', 'Tiny plastic fragments', 'Ocean plants', 'Salt particles'], correct: 1, explanation: 'Microplastics are small broken-down pieces of plastic.' },
    { question: 'How does plastic affect marine animals?', options: ['It helps them grow', 'It is often mistaken for food', 'It increases oxygen levels', 'It improves reproduction'], correct: 1, explanation: 'Animals ingest plastic thinking it is food.' },
    { question: 'What is one solution mentioned?', options: ['More plastic production', 'Recycling and bans on single-use plastics', 'Ignoring waste', 'Increasing ocean dumping'], correct: 1, explanation: 'Recycling and bans help reduce pollution.' },
    { question: 'What is the tone of the passage?', options: ['Concerned and informative', 'Humorous', 'Angry and aggressive', 'Completely neutral without concern'], correct: 0, explanation: 'It is informative with environmental concern.' }
  ]
},
{
  id: 27,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Consciousness and the Mind',
  text: 'Consciousness refers to the subjective experience of awareness, including thoughts, sensations, and emotions. It is one of the most difficult problems in both philosophy and neuroscience because it is unclear how physical processes in the brain produce subjective experience.\n\nSome theories suggest that consciousness emerges from complex neural interactions, while others propose that it may be a fundamental property of the universe itself. Despite advances in brain science, there is still no consensus on how or why consciousness arises.',
  questions: [
    { question: 'What is consciousness?', options: ['A physical organ', 'Subjective awareness and experience', 'A type of memory', 'A muscle function'], correct: 1, explanation: 'It refers to subjective experience.' },
    { question: 'Why is consciousness difficult to explain?', options: ['It is not real', 'It is unclear how brain activity creates experience', 'It has no scientific study', 'It is purely physical movement'], correct: 1, explanation: 'The link between brain and experience is unclear.' },
    { question: 'What is one theory mentioned?', options: ['It comes from electricity only', 'It emerges from neural activity', 'It is unrelated to the brain', 'It is purely random'], correct: 1, explanation: 'Some believe it emerges from brain processes.' },
    { question: 'What alternative view exists?', options: ['It is a universal property', 'It does not exist', 'It is only chemical', 'It is a dream state only'], correct: 0, explanation: 'Some think consciousness is fundamental.' },
    { question: 'The tone of the passage is:', options: ['Philosophical and uncertain', 'Humorous', 'Angry', 'Instructional step-by-step'], correct: 0, explanation: 'It discusses unresolved philosophical issues.' }
  ]
},
{
  id: 28,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'Desert Ecosystems',
  text: 'Deserts are dry environments that receive very little rainfall throughout the year. Despite harsh conditions, many plants and animals have adapted to survive in these regions. For example, cacti store water in their stems, and some animals are active only at night to avoid extreme heat.\n\nAlthough deserts may seem empty, they contain unique ecosystems with specially adapted life forms. These adaptations allow survival in one of the most extreme climates on Earth.',
  questions: [
    { question: 'What defines a desert?', options: ['High rainfall', 'Very low rainfall', 'Dense forests', 'Frozen land'], correct: 1, explanation: 'Deserts have very little rainfall.' },
    { question: 'How do cacti survive?', options: ['By moving', 'By storing water', 'By eating rocks', 'By flying'], correct: 1, explanation: 'They store water in stems.' },
    { question: 'Why are some animals nocturnal?', options: ['To find sunlight', 'To avoid daytime heat', 'To grow faster', 'To increase rainfall'], correct: 1, explanation: 'They avoid extreme heat.' },
    { question: 'What is true about deserts?', options: ['They have no life', 'They contain adapted ecosystems', 'They are underwater', 'They are always cold'], correct: 1, explanation: 'Life exists with adaptations.' },
    { question: 'The passage is mainly about:', options: ['Ocean life', 'Desert ecosystems and adaptations', 'Weather forecasting', 'Space travel'], correct: 1, explanation: 'It explains desert life.' }
  ]
},
{
  id: 29,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Space Exploration',
  text: 'Space exploration has allowed humans to learn more about the universe beyond Earth. Missions to the Moon, Mars, and other planets have provided valuable scientific data about planetary formation and the possibility of life elsewhere.\n\nHowever, space exploration is extremely expensive and technologically complex. Some argue that resources should instead be used to solve problems on Earth, while others believe exploration is essential for scientific progress and the long-term survival of humanity.',
  questions: [
    { question: 'What is one benefit of space exploration?', options: ['It reduces gravity', 'It provides scientific knowledge', 'It stops climate change', 'It eliminates diseases'], correct: 1, explanation: 'It expands scientific understanding.' },
    { question: 'What is one challenge?', options: ['Too many planets', 'High cost and complexity', 'Too much oxygen', 'No satellites exist'], correct: 1, explanation: 'It is expensive and difficult.' },
    { question: 'What have missions revealed?', options: ['Nothing useful', 'Information about planets and life potential', 'Only Earth data', 'Weather only'], correct: 1, explanation: 'They provide planetary information.' },
    { question: 'What is one argument against it?', options: ['It is too easy', 'Resources should focus on Earth problems', 'It is too fun', 'It is too fast'], correct: 1, explanation: 'Some prioritize Earth issues.' },
    { question: 'The tone of the passage is:', options: ['Balanced and informative', 'Angry', 'Humorous', 'Completely biased'], correct: 0, explanation: 'It presents both sides fairly.' }
  ]
},
{
  id: 30,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Limits of Human Knowledge',
  text: 'Human knowledge has expanded significantly over time, yet there are still fundamental limits to what can be known. In science, some systems are inherently unpredictable, such as chaotic systems where small changes in initial conditions can lead to vastly different outcomes.\n\nIn philosophy, questions about meaning, existence, and ultimate reality may not be fully answerable through empirical methods. Some thinkers believe these limits are temporary and will eventually be overcome, while others argue that they are permanent features of human cognition.',
  questions: [
    { question: 'What is the main idea?', options: ['Humans know everything', 'There are limits to human knowledge', 'Science is useless', 'Philosophy is meaningless'], correct: 1, explanation: 'The passage focuses on limits of knowledge.' },
    { question: 'What are chaotic systems?', options: ['Fully predictable systems', 'Systems sensitive to small changes', 'Systems without rules', 'Nonexistent systems'], correct: 1, explanation: 'Small changes lead to large effects.' },
    { question: 'What philosophical issue is mentioned?', options: ['Weather patterns', 'Meaning and existence', 'Gravity', 'Chemistry'], correct: 1, explanation: 'It discusses existential questions.' },
    { question: 'What is one viewpoint about limits?', options: ['They are permanent', 'They will be overcome', 'They do not exist', 'They are irrelevant'], correct: 1, explanation: 'Some believe limits can be overcome.' },
    { question: 'The tone of the passage is:', options: ['Reflective and analytical', 'Humorous', 'Angry', 'Excited'], correct: 0, explanation: 'It is thoughtful and analytical.' }
  ]
},
{
  id: 31,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Renewable Energy Transition',
  text: 'The global transition toward renewable energy sources such as solar and wind power is one of the most significant changes in modern infrastructure. These energy sources are considered renewable because they naturally replenish and produce little to no greenhouse gas emissions during operation. As a result, they are widely seen as essential tools in reducing the impacts of climate change.\n\nHowever, renewable energy also presents challenges. Solar and wind power are intermittent, meaning they depend on weather conditions and time of day. This inconsistency creates difficulties in maintaining a stable energy supply. To address this issue, improvements in battery storage systems and smart grid technologies are required. Despite these limitations, falling costs and technological advancements have made renewable energy increasingly competitive with fossil fuels.',
  questions: [
    { question: 'What is the main idea of the passage?', options: ['Renewable energy is perfect and has no drawbacks', 'Renewable energy is important for climate goals but has technical challenges', 'Fossil fuels are better than renewable energy', 'Renewable energy cannot be used globally'], correct: 1, explanation: 'It presents benefits and limitations.' },
    { question: 'Why are solar and wind considered renewable?', options: ['They are made from fossil fuels', 'They naturally replenish over time', 'They never stop working', 'They are artificially created'], correct: 1, explanation: 'They are naturally replenished sources.' },
    { question: 'What problem affects renewable energy supply?', options: ['Too much stability', 'Intermittency due to weather conditions', 'Lack of sunlight on Earth', 'Overproduction of energy'], correct: 1, explanation: 'Weather-dependent variability.' },
    { question: 'What is needed to improve reliability?', options: ['Less electricity use', 'Better storage and grid systems', 'Fewer power plants', 'More fossil fuel use'], correct: 1, explanation: 'Storage and grid upgrades are required.' },
    { question: 'What is the tone of the passage?', options: ['Balanced and informative', 'Angry', 'Humorous', 'One-sided criticism'], correct: 0, explanation: 'It explains both benefits and challenges.' },
  ]
},
{
  id: 32,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'The Water Cycle',
  text: 'The water cycle describes the continuous movement of water on, above, and below the surface of the Earth. It begins with evaporation, where heat from the sun turns water from oceans, rivers, and lakes into water vapor. This vapor rises into the atmosphere, where it cools and condenses into clouds.\n\nEventually, water falls back to Earth as precipitation, such as rain or snow. Some of this water collects in rivers and oceans, while some is absorbed into the ground. The cycle then repeats. This process is essential for distributing freshwater across the planet and supporting all living organisms.',
  questions: [
    { question: 'What starts the water cycle?', options: ['Wind movement', 'Sun’s heat causing evaporation', 'Ocean currents', 'Cloud formation'], correct: 1, explanation: 'Evaporation begins with solar heat.' },
    { question: 'What happens during condensation?', options: ['Water freezes instantly', 'Water vapor forms clouds', 'Rain falls immediately', 'Rivers dry up'], correct: 1, explanation: 'Clouds form during condensation.' },
    { question: 'What is precipitation?', options: ['Water turning into vapor', 'Water falling to Earth as rain or snow', 'Cloud formation', 'Ocean heating'], correct: 1, explanation: 'It is water returning to Earth.' },
    { question: 'What happens after precipitation?', options: ['Water disappears', 'Water collects or is absorbed and cycle continues', 'It becomes lava', 'It stops moving permanently'], correct: 1, explanation: 'Water returns to Earth systems.' },
    { question: 'What is the main purpose of the passage?', options: ['To explain climate change', 'To describe the water cycle process', 'To discuss pollution', 'To explain gravity'], correct: 1, explanation: 'It explains how the cycle works.' },
  ]
},
{
  id: 33,
  domain: 'D1',
  difficulty: 'Medium',
  title: 'Social Media Algorithms',
  text: 'Social media platforms use algorithms to determine what content users see in their feeds. These algorithms analyze user behavior, including likes, shares, comments, and time spent viewing posts, in order to predict what content will keep users engaged.\n\nWhile this improves personalization, it can also lead to “filter bubbles,” where users are repeatedly exposed to similar viewpoints. Over time, this may limit exposure to diverse perspectives and contribute to polarization. Critics also warn that such systems can increase the spread of misinformation if engaging but false content is prioritized.',
  questions: [
    { question: 'What is the main function of social media algorithms?', options: ['To delete accounts', 'To select content users are likely to engage with', 'To block all ads', 'To slow down apps'], correct: 1, explanation: 'They predict engaging content.' },
    { question: 'What data do algorithms analyze?', options: ['User passwords', 'User interactions like likes and viewing time', 'Phone storage', 'Battery level'], correct: 1, explanation: 'Behavior data is used.' },
    { question: 'What is a filter bubble?', options: ['A type of advertisement', 'Limited exposure to similar viewpoints', 'A broken internet connection', 'A security system'], correct: 1, explanation: 'It restricts viewpoint diversity.' },
    { question: 'What concern is mentioned?', options: ['Faster internet speeds', 'Misinformation and polarization', 'Lower screen brightness', 'More storage use'], correct: 1, explanation: 'Concerns include misinformation spread.' },
    { question: 'What is the passage mainly about?', options: ['History of phones', 'How algorithms shape online content', 'Gaming systems', 'Email communication'], correct: 1, explanation: 'It focuses on algorithm effects.' },
  ]
},
{
  id: 34,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Genetic Engineering Ethics',
  text: 'Genetic engineering allows scientists to modify DNA with high precision, particularly through technologies such as CRISPR. This has created possibilities for treating genetic disorders, improving agricultural crops, and advancing medical research.\n\nHowever, the technology raises serious ethical questions. Critics worry about unintended genetic consequences, unequal access to treatments, and the possibility of using gene editing for enhancement rather than medical necessity. The debate often centers on whether humanity should limit its ability to alter fundamental aspects of biology.',
  questions: [
    { question: 'What is CRISPR used for?', options: ['Weather forecasting', 'Editing DNA', 'Building machines', 'Measuring time'], correct: 1, explanation: 'CRISPR edits genetic material.' },
    { question: 'What is one benefit of genetic engineering?', options: ['Eliminating ecosystems', 'Treating genetic diseases', 'Increasing pollution', 'Reducing oxygen levels'], correct: 1, explanation: 'Medical treatment is a benefit.' },
    { question: 'What is a concern about gene editing?', options: ['Too much sunlight', 'Ethical risks and unequal access', 'Lack of electricity', 'Fewer plants'], correct: 1, explanation: 'Ethical concerns are central.' },
    { question: 'What is the “enhancement” issue?', options: ['Editing weather systems', 'Improving traits beyond medical necessity', 'Fixing grammar', 'Changing planets'], correct: 1, explanation: 'Non-medical genetic modification.' },
    { question: 'What is the tone of the passage?', options: ['Fully supportive', 'Balanced and analytical', 'Humorous', 'Angry'], correct: 1, explanation: 'It presents both sides.' },
  ]
},
{
  id: 35,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'The Evolution of Language',
  text: 'Language is one of the defining features of human civilization, but its origins are still not fully understood. Most linguists believe that early human communication began with simple vocal sounds and gestures, which gradually developed into more complex systems of grammar and syntax.\n\nOver thousands of years, languages evolved and diverged into the thousands of distinct languages spoken today. Despite their differences, all human languages share certain structural patterns, suggesting that they may originate from common cognitive abilities in the human brain.',
  questions: [
    { question: 'How did early language likely begin?', options: ['Fully developed writing systems', 'Simple sounds and gestures', 'Computer systems', 'Modern grammar rules'], correct: 1, explanation: 'Early communication was simple.' },
    { question: 'What happened to languages over time?', options: ['They stayed identical', 'They evolved into many different languages', 'They disappeared completely', 'They became one universal language'], correct: 1, explanation: 'They diversified.' },
    { question: 'What similarity do all languages share?', options: ['Same vocabulary', 'Structural patterns', 'Same writing system', 'Same alphabet'], correct: 1, explanation: 'They share structure patterns.' },
    { question: 'What does this suggest?', options: ['Languages are unrelated', 'Common cognitive origins in the brain', 'Language is random', 'Only one language is real'], correct: 1, explanation: 'Shared mental foundations.' },
    { question: 'What is the passage mainly about?', options: ['Modern slang', 'Origins and development of language', 'Internet communication', 'Animal sounds only'], correct: 1, explanation: 'It explains language evolution.' },
  ]
},
{
  id: 36,
  domain: 'D1',
  difficulty: 'Easy',
  title: 'Electric Circuits Basics',
  text: 'An electric circuit is a complete path that allows electric current to flow. It usually includes a power source, conductive wires, and a device that uses the electricity, such as a light bulb or resistor. When the circuit is closed, electricity flows continuously and the device functions as intended.\n\nIf the circuit is open, the path is broken and the flow of electricity stops. Circuits are fundamental to all electrical systems, from simple household appliances to complex electronic devices. Understanding how they work is essential for studying physics and engineering.',
  questions: [
    { question: 'What is an electric circuit?', options: ['A broken wire system', 'A closed path for electric current', 'A type of battery', 'A light source only'], correct: 1, explanation: 'A circuit is a complete path for current.' },
    { question: 'What happens when a circuit is closed?', options: ['Current stops', 'Electricity flows continuously', 'Voltage disappears', 'Devices shut down permanently'], correct: 1, explanation: 'Closed circuits allow current flow.' },
    { question: 'What happens when a circuit is open?', options: ['Current increases', 'Current stops flowing', 'Energy multiplies', 'Resistance disappears'], correct: 1, explanation: 'Open circuits break the path.' },
    { question: 'What is the purpose of a device in a circuit?', options: ['To block electricity', 'To use electrical energy', 'To store sound', 'To create gravity'], correct: 1, explanation: 'Devices consume electrical energy.' },
    { question: 'The passage mainly explains:', options: ['Weather systems', 'Basic electrical circuits', 'Human biology', 'Space travel'], correct: 1, explanation: 'It focuses on circuits.' },
  ]
},
{
  id: 37,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Ocean Plastic Pollution',
  text: 'Plastic pollution in the oceans has become a major environmental concern. Each year, millions of tons of plastic waste enter marine ecosystems, where it breaks down into smaller particles known as microplastics. These particles are extremely difficult to remove once they enter the ocean.\n\nMarine animals often mistake plastic for food, which can lead to injury, starvation, or death. In addition, microplastics can enter the food chain, raising concerns about potential impacts on human health. Efforts to reduce pollution include recycling programs, bans on single-use plastics, and international cleanup initiatives.',
  questions: [
    { question: 'What is the main idea of the passage?', options: ['Oceans are naturally clean', 'Plastic pollution harms oceans and is difficult to control', 'Plastic improves marine life', 'Fishing removes all pollution'], correct: 1, explanation: 'Focus is on pollution and harm.' },
    { question: 'What are microplastics?', options: ['Large plastic objects', 'Tiny plastic particles', 'Ocean plants', 'Salt crystals'], correct: 1, explanation: 'Microplastics are small plastic pieces.' },
    { question: 'Why is plastic dangerous to marine life?', options: ['It increases oxygen', 'It is mistaken for food', 'It makes water colder', 'It removes predators'], correct: 1, explanation: 'Animals ingest plastic.' },
    { question: 'What is one solution mentioned?', options: ['More plastic production', 'Recycling and bans on single-use plastics', 'Ignoring waste', 'Increasing fishing'], correct: 1, explanation: 'Reduction strategies are listed.' },
    { question: 'What is the tone of the passage?', options: ['Neutral and descriptive', 'Concerned and informative', 'Humorous', 'Angry and emotional'], correct: 1, explanation: 'It warns about environmental issues.' },
  ]
},
{
  id: 38,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'The Philosophy of Free Will',
  text: 'The concept of free will raises one of the most enduring questions in philosophy: do humans truly have the ability to make independent choices, or are all actions determined by prior causes? Determinists argue that every event, including human thought, is the result of preceding conditions such as biology, environment, and past experiences.\n\nOthers defend free will, claiming that individuals have genuine agency and can choose differently under identical conditions. A third position, compatibilism, attempts to reconcile both views by suggesting that free will is compatible with determinism if it is defined as acting according to one’s internal motivations without external coercion.',
  questions: [
    { question: 'What is the central issue discussed?', options: ['The nature of language', 'Free will versus determinism', 'The structure of atoms', 'The origin of life'], correct: 1, explanation: 'It focuses on free will debate.' },
    { question: 'What do determinists believe?', options: ['Choices are random', 'All actions are caused by prior conditions', 'Humans are completely free', 'Only emotions matter'], correct: 1, explanation: 'Determinism is causation-based.' },
    { question: 'What do free will supporters believe?', options: ['Choices are illusions', 'Humans can make independent decisions', 'Only machines decide', 'Everything is predetermined'], correct: 1, explanation: 'They support agency.' },
    { question: 'What is compatibilism?', options: ['Belief that both views can coexist', 'Rejection of causation', 'Belief in randomness only', 'Denial of philosophy'], correct: 0, explanation: 'It reconciles both theories.' },
    { question: 'What is the tone of the passage?', options: ['Emotional', 'Analytical and philosophical', 'Humorous', 'Angry'], correct: 1, explanation: 'It is reflective and academic.' },
  ]
},
{
  id: 39,
  domain: 'D1',
  difficulty: 'Medium',
  title: 'Weather vs Climate',
  text: 'Weather refers to short-term atmospheric conditions such as temperature, precipitation, and wind at a specific time and place. In contrast, climate describes long-term patterns of weather observed over decades or centuries in a region.\n\nAlthough extreme weather events can occur, they do not necessarily indicate changes in climate. Climate change refers to long-term shifts in average conditions, often influenced by human activities such as greenhouse gas emissions. Understanding the distinction between weather and climate is essential for interpreting environmental data correctly.',
  questions: [
    { question: 'What is weather?', options: ['Long-term patterns', 'Short-term atmospheric conditions', 'Ocean levels', 'Solar radiation only'], correct: 1, explanation: 'Weather is short-term.' },
    { question: 'What is climate?', options: ['Daily temperature', 'Long-term weather patterns', 'Wind only', 'Rain only'], correct: 1, explanation: 'Climate is long-term averages.' },
    { question: 'Why is the distinction important?', options: ['They are identical', 'Weather events do not always reflect climate change', 'Climate changes hourly', 'Weather has no patterns'], correct: 1, explanation: 'One event doesn’t define climate.' },
    { question: 'What drives climate change in the passage?', options: ['Ocean tides', 'Greenhouse gas emissions', 'Moon phases', 'Earthquakes'], correct: 1, explanation: 'Human emissions are mentioned.' },
    { question: 'The passage mainly explains:', options: ['Storm prediction', 'Difference between weather and climate', 'Ocean pollution', 'Space science'], correct: 1, explanation: 'It contrasts the two concepts.' },
  ]
},
{
  id: 40,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'The Nervous System',
  text: 'The human nervous system is responsible for transmitting signals throughout the body and coordinating actions. It consists of the brain, spinal cord, and an extensive network of nerves that reach all parts of the body.\n\nWhen a stimulus is detected, sensory neurons send signals to the brain for processing. The brain then responds by sending signals through motor neurons to muscles and organs, allowing the body to react quickly to changes in the environment.',
  questions: [
    { question: 'What is the main function of the nervous system?', options: ['Digesting food', 'Transmitting and processing signals', 'Producing bones', 'Circulating blood'], correct: 1, explanation: 'It controls communication in the body.' },
    { question: 'What detects stimuli?', options: ['Motor neurons', 'Sensory neurons', 'Muscles', 'Skin only'], correct: 1, explanation: 'Sensory neurons detect input.' },
    { question: 'What does the brain do?', options: ['Stores oxygen', 'Processes information', 'Creates blood', 'Builds muscles'], correct: 1, explanation: 'The brain processes signals.' },
    { question: 'What do motor neurons do?', options: ['Send responses to the body', 'Detect light', 'Store energy', 'Produce hormones'], correct: 1, explanation: 'They carry output signals.' },
    { question: 'The passage mainly explains:', options: ['Digestive system', 'Structure and function of nervous system', 'Cell division', 'DNA structure'], correct: 1, explanation: 'It focuses on nervous system function.' },
  ]
},
{
  id: 36,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'Electric Circuits Basics',
  text: 'An electric circuit is a complete path that allows electric current to flow. It is typically made up of a power source, conductive wires, and a device such as a light bulb or resistor that uses the electrical energy. When the circuit is closed, meaning there are no breaks in the path, electricity can flow continuously and power devices. When the circuit is open, the path is broken and the flow of electricity stops completely. Electric circuits are fundamental to nearly all modern technology, from household appliances to computers and transportation systems. Engineers design circuits carefully to control how electricity moves and ensure devices function safely and efficiently. Understanding how circuits work is one of the first steps in learning electrical engineering and physics, as it explains how energy is transferred and used in everyday life.',
  questions: [
    { question: 'Which statement BEST describes an electric circuit?', options: ['A broken wire system', 'A complete path for electric current flow', 'A device that stores light', 'A type of battery only'], correct: 1, explanation: 'A circuit is a complete path for current.' },
    { question: 'What happens when a circuit is closed?', options: ['Electricity stops completely', 'Electricity flows continuously', 'Voltage disappears', 'Devices become disconnected'], correct: 1, explanation: 'Closed circuits allow current flow.' },
    { question: 'What is the role of a device like a light bulb in a circuit?', options: ['To store electricity', 'To use electrical energy', 'To block current flow', 'To create wires'], correct: 1, explanation: 'Loads use electrical energy.' },
    { question: 'Why are electric circuits important?', options: ['They are only used in science labs', 'They power modern technology and devices', 'They replace batteries', 'They stop electricity from flowing'], correct: 1, explanation: 'Circuits power technology.' },
    { question: 'The passage is mainly about:', options: ['How electricity is generated in stars', 'Basic structure and function of electric circuits', 'History of batteries', 'Computer programming'], correct: 1, explanation: 'It explains circuits.' }
  ]
},
{
  id: 37,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Ocean Plastic Pollution',
  text: 'Plastic pollution in the world’s oceans has become one of the most serious environmental challenges of the modern era. Each year, millions of tons of plastic waste enter marine ecosystems through rivers, coastal cities, and improper waste disposal. Over time, larger plastic items break down into microplastics, which are tiny fragments that are difficult to remove from the environment. Marine animals often mistake plastic for food, leading to injury, starvation, or death. These plastics can also enter the food chain, eventually reaching humans through seafood consumption. Governments and organizations have introduced solutions such as banning single-use plastics, improving recycling systems, and organizing ocean cleanup efforts. However, despite these actions, the problem continues to grow due to increasing global consumption and waste production.',
  questions: [
    { question: 'What is the MAIN concern about ocean plastic?', options: ['It improves marine ecosystems', 'It harms wildlife and enters the food chain', 'It increases ocean depth', 'It creates oxygen in water'], correct: 1, explanation: 'Plastic harms animals and enters food chains.' },
    { question: 'What are microplastics?', options: ['Large plastic containers', 'Tiny plastic fragments', 'Ocean plants', 'Salt particles'], correct: 1, explanation: 'They are small plastic pieces.' },
    { question: 'Why is plastic dangerous to marine animals?', options: ['It dissolves instantly', 'It is mistaken for food', 'It increases their size', 'It improves digestion'], correct: 1, explanation: 'Animals eat plastic by mistake.' },
    { question: 'Which solution is mentioned in the passage?', options: ['Increasing plastic production', 'Banning single-use plastics', 'Reducing ocean size', 'Stopping seafood consumption'], correct: 1, explanation: 'Bans and recycling are solutions.' },
    { question: 'The passage is mainly:', options: ['A description of ocean geography', 'An explanation of plastic pollution and its effects', 'A story about fishing', 'A discussion of weather patterns'], correct: 1, explanation: 'It focuses on pollution.' }
  ]
},
{
  id: 38,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Consciousness and the Mind',
  text: 'Consciousness refers to the subjective experience of being aware of thoughts, sensations, and the external world. It is one of the most complex and debated topics in both neuroscience and philosophy. Some researchers argue that consciousness arises from the activity of neurons in the brain, suggesting that it is an emergent property of complex biological systems. Others propose that consciousness may be more fundamental, possibly existing as a basic feature of the universe itself. Despite advances in brain imaging and cognitive science, there is still no widely accepted explanation for how physical processes in the brain produce subjective experience. This gap between physical brain activity and personal experience is often referred to as the “hard problem” of consciousness.',
  questions: [
    { question: 'What is consciousness BEST described as?', options: ['A muscle movement system', 'Subjective awareness of experience', 'A type of memory storage', 'A chemical reaction only'], correct: 1, explanation: 'It is subjective experience.' },
    { question: 'What is one theory about consciousness?', options: ['It comes from rocks', 'It emerges from brain activity', 'It only exists in machines', 'It does not exist'], correct: 1, explanation: 'Emergence theory.' },
    { question: 'What is the “hard problem” of consciousness?', options: ['Why people sleep', 'How brain activity creates experience', 'How muscles move', 'Why animals eat'], correct: 1, explanation: 'Link between brain and experience.' },
    { question: 'What is another proposed idea?', options: ['It is a basic feature of the universe', 'It is only imagination', 'It is a type of virus', 'It is identical to gravity'], correct: 1, explanation: 'Some think it is fundamental.' },
    { question: 'The passage is mainly:', options: ['A story about psychology experiments', 'An explanation of different theories of consciousness', 'A medical diagnosis guide', 'A physics formula sheet'], correct: 1, explanation: 'It compares theories.' }
  ]
},
{
  id: 39,
  domain: 'D1',
  difficulty: 'Medium',
  title: 'Weather vs Climate',
  text: 'Weather refers to short-term atmospheric conditions such as temperature, rainfall, wind, and humidity in a specific place and time. It can change rapidly from day to day or even hour to hour. Climate, on the other hand, describes the long-term average patterns of weather in a region over many years or decades. While a single storm or heatwave reflects weather, it does not necessarily indicate a change in climate. Climate change refers to long-term shifts in these average patterns, often linked to human activities such as greenhouse gas emissions. Understanding the difference between weather and climate is essential for interpreting scientific data and avoiding misconceptions about environmental changes.',
  questions: [
    { question: 'What BEST describes weather?', options: ['Long-term patterns', 'Short-term atmospheric conditions', 'Ocean currents', 'Solar energy only'], correct: 1, explanation: 'Weather is short-term conditions.' },
    { question: 'What is climate?', options: ['Daily rainfall', 'Long-term weather patterns', 'Wind speed only', 'Cloud formation only'], correct: 1, explanation: 'Climate is long-term average conditions.' },
    { question: 'Why is a single storm NOT climate change?', options: ['Because storms are unrelated to weather', 'Because climate refers to long-term patterns', 'Because storms do not exist', 'Because climate changes hourly'], correct: 1, explanation: 'Climate is long-term.' },
    { question: 'What is a cause of climate change mentioned?', options: ['Earth’s rotation', 'Greenhouse gas emissions', 'Moon phases', 'Wind direction'], correct: 1, explanation: 'Human emissions contribute.' },
    { question: 'The passage mainly explains:', options: ['How storms are formed', 'Difference between weather and climate', 'How oceans move', 'How plants grow'], correct: 1, explanation: 'It compares weather and climate.' }
  ]
},
{
  id: 40,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'The Nervous System',
  text: 'The human nervous system is a complex network responsible for controlling and coordinating bodily functions. It consists of the brain, spinal cord, and an extensive network of nerves that transmit signals throughout the body. When a stimulus is detected, such as heat or touch, sensory neurons carry information to the brain. The brain processes this information and sends responses through motor neurons, which activate muscles or glands. This system allows humans to react quickly to changes in their environment, maintain balance, and perform both voluntary and involuntary actions. Without the nervous system, communication between different parts of the body would not be possible.',
  questions: [
    { question: 'What is the main function of the nervous system?', options: ['To digest food', 'To control and coordinate body functions', 'To produce bones', 'To store oxygen'], correct: 1, explanation: 'It controls body functions.' },
    { question: 'What do sensory neurons do?', options: ['Send responses to muscles', 'Carry information to the brain', 'Store energy', 'Create blood cells'], correct: 1, explanation: 'They send signals to the brain.' },
    { question: 'What is the role of motor neurons?', options: ['Detect stimuli', 'Carry responses to muscles or glands', 'Store memory', 'Break down food'], correct: 1, explanation: 'They send output signals.' },
    { question: 'Why is the nervous system important?', options: ['It makes bones stronger', 'It enables communication in the body', 'It creates oxygen', 'It controls weather'], correct: 1, explanation: 'It enables communication.' },
    { question: 'The passage is mainly about:', options: ['Human digestion', 'Structure and function of the nervous system', 'Plant biology', 'Electricity'], correct: 1, explanation: 'It explains nervous system function.' }
  ]
},
{
  id: 41,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Electric Circuits and Ohm’s Law',
  text: 'An electric circuit is a system that allows electric current to flow through a closed loop. It typically consists of a power source such as a battery, conductive wires, and one or more components like resistors or bulbs that use electrical energy. For current to flow, the circuit must be complete; if there is a break anywhere in the loop, the circuit becomes open and current stops. One of the key principles used to understand circuits is Ohm’s Law, which describes the relationship between voltage, current, and resistance. According to this principle, increasing voltage increases current if resistance remains constant, while increasing resistance reduces current. Engineers use these relationships to design safe and efficient electrical systems in everything from household devices to large-scale power grids.',
  questions: [
    { question: 'What is required for current to flow in a circuit?', options: ['A broken path', 'A closed loop', 'Only a battery', 'A resistor only'], correct: 1, explanation: 'Current flows only in a closed loop.' },
    { question: 'What does Ohm’s Law describe?', options: ['Weather patterns', 'Relationship between voltage, current, and resistance', 'Gravity effects', 'Heat transfer only'], correct: 1, explanation: 'It relates V, I, and R.' },
    { question: 'What happens if resistance increases (voltage constant)?', options: ['Current increases', 'Current decreases', 'Voltage disappears', 'Energy is created'], correct: 1, explanation: 'Higher resistance reduces current.' },
    { question: 'What is the role of components like bulbs in a circuit?', options: ['Store water', 'Use electrical energy', 'Block all current', 'Create voltage'], correct: 1, explanation: 'They consume electrical energy.' },
    { question: 'The passage is mainly about:', options: ['Electric circuits and their principles', 'History of electricity', 'Solar energy only', 'Magnetism'], correct: 1, explanation: 'It explains circuits and Ohm’s Law.' }
  ]
},
{
  id: 42,
  domain: 'D2',
  difficulty: 'Easy',
  title: 'Photosynthesis Process',
  text: 'Photosynthesis is the process by which green plants convert sunlight into chemical energy. It takes place mainly in the leaves, where a pigment called chlorophyll captures light energy from the sun. Plants use this energy to combine carbon dioxide from the air and water from the soil to produce glucose, a type of sugar that provides food for the plant. Oxygen is released as a byproduct during this process. Photosynthesis is essential for life on Earth because it forms the base of most food chains and provides oxygen that many living organisms need to survive. Without photosynthesis, ecosystems would collapse due to a lack of energy and breathable air.',
  questions: [
    { question: 'What is photosynthesis?', options: ['Breaking down food', 'Converting sunlight into chemical energy', 'Producing heat', 'Absorbing soil only'], correct: 1, explanation: 'Plants convert light into energy.' },
    { question: 'Where does photosynthesis mainly occur?', options: ['Roots', 'Leaves', 'Stems only', 'Flowers only'], correct: 1, explanation: 'It occurs in leaves.' },
    { question: 'What gas is released?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'], correct: 1, explanation: 'Oxygen is released.' },
    { question: 'Why is photosynthesis important?', options: ['It creates storms', 'It supports food chains and oxygen supply', 'It cools oceans', 'It stops erosion'], correct: 1, explanation: 'It supports life systems.' },
    { question: 'The passage mainly explains:', options: ['Plant reproduction only', 'How plants convert sunlight into energy', 'Weather patterns', 'Soil formation'], correct: 1, explanation: 'It describes photosynthesis.' }
  ]
},
{
  id: 43,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Plate Tectonics and Earthquakes',
  text: 'Earth’s outer layer, called the lithosphere, is broken into several large tectonic plates that float on the semi-fluid asthenosphere beneath them. These plates are constantly moving, although extremely slowly, due to convection currents in the Earth’s mantle. When plates collide, separate, or slide past one another, they can cause powerful geological events such as earthquakes, volcanic eruptions, and mountain formation. For example, when two continental plates collide, the crust may be pushed upward to form mountain ranges. When plates move apart, magma can rise to create new crust. These processes have shaped Earth’s surface over millions of years and continue to do so today.',
  questions: [
    { question: 'What are tectonic plates?', options: ['Cloud layers', 'Large sections of Earth’s crust', 'Ocean waves', 'Wind systems'], correct: 1, explanation: 'They are crustal sections.' },
    { question: 'What causes plate movement?', options: ['Wind', 'Convection currents in the mantle', 'Rainfall', 'Moonlight'], correct: 1, explanation: 'Mantle convection drives movement.' },
    { question: 'What can happen when plates collide?', options: ['Rain increases', 'Mountains form', 'Oceans freeze', 'Gravity disappears'], correct: 1, explanation: 'Collisions form mountains.' },
    { question: 'What happens when plates separate?', options: ['New crust can form', 'Earth stops rotating', 'Mountains disappear instantly', 'Air pressure vanishes'], correct: 0, explanation: 'New crust forms from magma.' },
    { question: 'The passage is mainly about:', options: ['Weather systems', 'Movement of Earth’s plates and its effects', 'Ocean currents', 'Animal evolution'], correct: 1, explanation: 'It explains plate tectonics.' }
  ]
},
{
  id: 44,
  domain: 'D1',
  difficulty: 'Medium',
  title: 'Inference in Reading',
  text: 'Inference is the process of understanding information that is not directly stated in a text by using clues and prior knowledge. Instead of being explicitly told everything, readers must “read between the lines” to determine implied meanings. For example, if a character is described as shivering and wearing a heavy coat, the reader can infer that the environment is cold. Inference is an important reading skill because it helps readers understand deeper meanings, motivations, and hidden messages in both fiction and nonfiction texts. Skilled readers constantly combine textual evidence with logical thinking to form conclusions that go beyond what is directly written.',
  questions: [
    { question: 'What is inference?', options: ['Copying text exactly', 'Understanding implied meaning using clues', 'Reading only titles', 'Skipping difficult words'], correct: 1, explanation: 'Inference uses clues and reasoning.' },
    { question: 'What does “read between the lines” mean?', options: ['Ignore the text', 'Find hidden or implied meaning', 'Read faster', 'Memorize words'], correct: 1, explanation: 'It means interpret implied ideas.' },
    { question: 'What helps readers make inferences?', options: ['Guessing randomly', 'Clues and prior knowledge', 'Ignoring details', 'Only grammar rules'], correct: 1, explanation: 'Inference uses clues + knowledge.' },
    { question: 'Why is inference important?', options: ['It replaces reading', 'It helps understand deeper meaning', 'It shortens texts', 'It removes vocabulary'], correct: 1, explanation: 'It improves comprehension.' },
    { question: 'The passage mainly explains:', options: ['Math solving strategies', 'Reading comprehension skill of inference', 'History events', 'Writing grammar rules'], correct: 1, explanation: 'It teaches inference.' }
  ]
},
{
  id: 45,
  domain: 'D2',
  difficulty: 'Medium',
  title: 'Water Cycle in Nature',
  text: 'The water cycle is a continuous natural process that moves water between Earth’s surface and the atmosphere. It begins with evaporation, where heat from the sun causes water in oceans, lakes, and rivers to turn into vapor. This vapor rises and cools in the atmosphere, forming clouds through condensation. Eventually, water falls back to Earth as precipitation, which includes rain, snow, sleet, or hail. Some of this water collects in bodies of water, while some seeps into the ground, and the cycle repeats. The water cycle is essential for maintaining ecosystems, supplying freshwater, and regulating Earth’s climate. Without it, life as we know it would not be possible.',
  questions: [
    { question: 'What starts the water cycle?', options: ['Wind', 'Sun’s heat causing evaporation', 'Earth’s rotation', 'Cloud movement'], correct: 1, explanation: 'Evaporation is powered by the sun.' },
    { question: 'What happens during condensation?', options: ['Water turns into vapor', 'Clouds form from cooled vapor', 'Rain disappears', 'Rivers freeze'], correct: 1, explanation: 'Clouds form.' },
    { question: 'What is precipitation?', options: ['Water rising into air', 'Water falling to Earth', 'Water boiling', 'Ocean currents'], correct: 1, explanation: 'It is falling water.' },
    { question: 'Why is the water cycle important?', options: ['It creates storms only', 'It supports ecosystems and freshwater supply', 'It stops evaporation', 'It removes gravity'], correct: 1, explanation: 'It sustains life.' },
    { question: 'The passage is mainly about:', options: ['Ocean currents', 'Movement of water through Earth and atmosphere', 'Weather forecasting tools', 'Solar energy systems'], correct: 1, explanation: 'It explains the water cycle.' }
  ]
},
{
  id: 46,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Genetics and Variation',
  text: 'Genetics is the branch of biology that studies how traits are inherited from one generation to the next through genes. Genes are segments of DNA that contain instructions for building proteins, which in turn influence physical and biological characteristics such as eye color, height, and susceptibility to certain diseases. However, inheritance is not purely deterministic. While genes provide a blueprint, environmental factors such as nutrition, climate, and lifestyle can significantly influence how traits are expressed. This interaction between genetics and environment is known as gene-environment interaction. In addition, genetic variation within populations is essential for evolution, as it allows species to adapt to changing environments over time. Without variation, populations would be more vulnerable to disease and environmental changes, reducing their chances of survival.',
  questions: [
    { question: 'What is the BEST description of genes?', options: ['Structures that store water', 'Segments of DNA that influence traits', 'Types of cells in the brain', 'External environmental factors'], correct: 1, explanation: 'Genes are DNA segments that influence traits.' },
    { question: 'Why is inheritance NOT purely genetic according to the passage?', options: ['Because genes do not exist', 'Because environment also affects traits', 'Because DNA changes daily', 'Because traits are random only'], correct: 1, explanation: 'Environment influences gene expression.' },
    { question: 'What does gene-environment interaction refer to?', options: ['Genes working without DNA', 'Interaction between genetic traits and environmental factors', 'Weather affecting DNA directly', 'Only inherited diseases'], correct: 1, explanation: 'It combines genes and environment.' },
    { question: 'Why is genetic variation important?', options: ['It prevents evolution', 'It helps populations adapt and survive', 'It removes diseases completely', 'It stops reproduction'], correct: 1, explanation: 'Variation supports adaptation.' },
    { question: 'The passage implies that:', options: ['Genes alone determine everything', 'Both genes and environment shape traits', 'Environment has no role in biology', 'Evolution is no longer occurring'], correct: 1, explanation: 'Traits come from both factors.' }
  ]
},
{
  id: 47,
  domain: 'D1',
  difficulty: 'Hard',
  title: 'Author’s Intent and Meaning',
  text: 'When analyzing a text, understanding the author’s intent requires looking beyond the literal meaning of words. Authors often choose specific language, tone, and structure to influence how readers interpret information. For example, two texts about the same event may present very different perspectives depending on what details are included or omitted. Readers must consider not only what is stated, but also what is emphasized or left unsaid. This helps reveal bias, purpose, and underlying assumptions. Identifying intent is especially important in persuasive writing, where the author may be trying to convince the reader of a particular viewpoint using emotional or logical appeals.',
  questions: [
    { question: 'What does author’s intent refer to?', options: ['The number of words used', 'The reason and purpose behind writing', 'The page layout', 'The grammar style only'], correct: 1, explanation: 'It is the author’s purpose.' },
    { question: 'Why might two texts about the same event differ?', options: ['Because facts never exist', 'Because authors choose different details to include', 'Because events change instantly', 'Because language is random'], correct: 1, explanation: 'Selection of details changes perspective.' },
    { question: 'What must readers consider beyond words?', options: ['Font size only', 'What is emphasized or omitted', 'Paper color', 'Number of paragraphs'], correct: 1, explanation: 'Omissions matter for meaning.' },
    { question: 'What is bias in a text?', options: ['Random spelling errors', 'A particular viewpoint shaping presentation', 'A math mistake', 'A type of punctuation'], correct: 1, explanation: 'Bias is perspective influence.' },
    { question: 'The passage mainly teaches:', options: ['How to memorize texts', 'How to analyze author purpose and perspective', 'How to write poetry', 'How to count words'], correct: 1, explanation: 'It focuses on analysis.' }
  ]
},
{
  id: 48,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Neuroscience and Decision Making',
  text: 'Human decision-making is a complex process involving multiple regions of the brain. The prefrontal cortex plays a key role in evaluating options, predicting outcomes, and controlling impulses, while other regions such as the limbic system are associated with emotion and reward processing. Decisions are rarely purely rational; instead, they emerge from the interaction between emotional responses and logical reasoning. Neuroscientists have found that past experiences also influence decisions by shaping neural pathways, making certain responses more likely over time. This means that decision-making is both biological and experiential, shaped by a combination of brain structure, chemistry, and personal history.',
  questions: [
    { question: 'Which brain region is most involved in reasoning and planning?', options: ['Limbic system', 'Prefrontal cortex', 'Spinal cord', 'Cerebellum only'], correct: 1, explanation: 'Prefrontal cortex handles planning.' },
    { question: 'What role does the limbic system play?', options: ['Logical calculation', 'Emotion and reward processing', 'Bone formation', 'Vision only'], correct: 1, explanation: 'It processes emotion and reward.' },
    { question: 'Why are decisions not purely rational?', options: ['Because logic does not exist', 'Because emotion and logic interact', 'Because brains are inactive', 'Because memory is unrelated'], correct: 1, explanation: 'Both systems influence decisions.' },
    { question: 'How do past experiences affect decisions?', options: ['They have no effect', 'They shape neural pathways', 'They erase memory', 'They stop thinking'], correct: 1, explanation: 'Experience influences brain wiring.' },
    { question: 'The passage suggests that decision-making is:', options: ['Purely random', 'A mix of biology and experience', 'Only emotional', 'Only logical'], correct: 1, explanation: 'It combines multiple factors.' }
  ]
},
{
  id: 49,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Language Evolution and Cognition',
  text: 'Language is not only a communication tool but also a reflection of human cognition. Linguists believe that language evolved gradually, beginning with simple gestures and vocal sounds before developing into complex grammatical systems. Over time, languages diversified into thousands of distinct forms across the world. Despite this diversity, all human languages share structural patterns, suggesting that the human brain may be wired with an underlying linguistic framework. Some researchers argue that language shapes thought itself, influencing how individuals perceive reality, a concept known as linguistic relativity. Others argue that thought exists independently of language, and language merely expresses pre-existing ideas.',
  questions: [
    { question: 'How did language most likely begin?', options: ['Fully formed grammar systems', 'Simple gestures and vocal sounds', 'Written books', 'Mathematical symbols'], correct: 1, explanation: 'Early language was simple.' },
    { question: 'What does linguistic relativity suggest?', options: ['Language has no effect on thought', 'Language influences how people perceive reality', 'All languages are identical', 'Thought does not exist'], correct: 1, explanation: 'Language shapes perception.' },
    { question: 'What do all languages share?', options: ['Same vocabulary', 'Structural patterns', 'Same alphabet', 'Same pronunciation'], correct: 1, explanation: 'They share structure.' },
    { question: 'What is the opposing view?', options: ['Language creates the universe', 'Thought exists independently of language', 'Language is random', 'Only one language exists'], correct: 1, explanation: 'Thought may exist without language.' },
    { question: 'The passage mainly discusses:', options: ['Animal communication', 'Origins and cognitive role of language', 'Grammar rules', 'Writing systems only'], correct: 1, explanation: 'It explores language evolution and cognition.' }
  ]
},
{
  id: 50,
  domain: 'D2',
  difficulty: 'Hard',
  title: 'Energy, Systems, and Conservation',
  text: 'In physics, energy is defined as the ability to do work, and it exists in many forms such as kinetic, potential, thermal, chemical, and electrical energy. One of the fundamental principles in science is the law of conservation of energy, which states that energy cannot be created or destroyed, only transformed from one form to another. In real-world systems, energy transformations are often inefficient, meaning some energy is converted into heat due to friction or resistance. This explains why machines require continuous energy input to maintain motion. Understanding energy transfer is essential for designing efficient systems in engineering, from engines to electrical grids and renewable energy technologies.',
  questions: [
    { question: 'What is energy defined as?', options: ['Matter that cannot move', 'Ability to do work', 'A type of light only', 'A chemical element'], correct: 1, explanation: 'Energy is ability to do work.' },
    { question: 'What does the law of conservation state?', options: ['Energy disappears', 'Energy is created from nothing', 'Energy is neither created nor destroyed', 'Energy stops existing'], correct: 2, explanation: 'It is conserved.' },
    { question: 'Why are real systems inefficient?', options: ['Energy is always destroyed', 'Some energy becomes heat due to friction', 'Energy stops moving', 'Machines remove energy'], correct: 1, explanation: 'Friction causes heat loss.' },
    { question: 'Why do machines need continuous energy?', options: ['Because energy increases automatically', 'Because energy is lost through transformations', 'Because gravity stops working', 'Because motion creates energy'], correct: 1, explanation: 'Energy is dissipated.' },
    { question: 'The passage is mainly about:', options: ['Biology systems', 'Energy forms and conservation principles', 'Weather systems', 'Language structure'], correct: 1, explanation: 'It explains energy concepts.' }
  ]
},
];

const PASSAGE_READ_TIME = 30;
const QUESTION_TIME = 10;
const QUESTIONS_PER_PASSAGE = 5;

export default function DeepDiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isDailyChallenge = params.isDailyChallenge === '1';
  const dailyGames = (params.dailyGames as string || '').split(',').map(Number).filter(Boolean);
  const currentIndex = parseInt(params.currentIndex as string || '0');
  const isLastGame = currentIndex >= dailyGames.length - 1;

  const [gameState, setGameState] = useState<'reading' | 'questions' | 'paused' | 'results'>('reading');
  const [prevGameState, setPrevGameState] = useState<'reading' | 'questions'>('reading');

  const [passageIndex] = useState(() => Math.floor(Math.random() * PASSAGES.length));
  const passage = PASSAGES[passageIndex];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const [timeLeft, setTimeLeft] = useState(PASSAGE_READ_TIME);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [speedyCount, setSpeedyCount] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const timerRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [floatingScore, setFloatingScore] = useState<string | null>(null);

  // Bubble animations
  const bubble1Y = useRef(new Animated.Value(0)).current;
  const bubble2Y = useRef(new Animated.Value(0)).current;
  const bubble3Y = useRef(new Animated.Value(0)).current;
  const bubble4Y = useRef(new Animated.Value(0)).current;

  // Coral sway animations
  const coral1Sway = useRef(new Animated.Value(0)).current;
  const coral2Sway = useRef(new Animated.Value(0)).current;

  // Creature movement
  const dolphinX = useRef(new Animated.Value(-80)).current;
  const turtleX = useRef(new Animated.Value(-60)).current;
  const diverX = useRef(new Animated.Value(-80)).current;
  const turtle2X = useRef(new Animated.Value(-60)).current;

  // Start ocean animations
  useEffect(() => {
    // Bubbles float up continuously
    const animateBubble = (anim: Animated.Value, duration: number, delay: number) => {
      anim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -300, duration, useNativeDriver: true }),
        ])
      ).start();
    };
    animateBubble(bubble1Y, 4000, 0);
    animateBubble(bubble2Y, 5500, 800);
    animateBubble(bubble3Y, 3800, 1600);
    animateBubble(bubble4Y, 4800, 400);

    // Coral sway
    Animated.loop(
      Animated.sequence([
        Animated.timing(coral1Sway, { toValue: 6, duration: 1800, useNativeDriver: true }),
        Animated.timing(coral1Sway, { toValue: -6, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(coral2Sway, { toValue: -8, duration: 2200, useNativeDriver: true }),
        Animated.timing(coral2Sway, { toValue: 8, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Dolphin swims across occasionally
    const swimmDolphin = () => {
      dolphinX.setValue(-80);
      Animated.timing(dolphinX, { toValue: 420, duration: 4000, useNativeDriver: true }).start(() => {
        setTimeout(swimmDolphin, 8000);
      });
    };
    setTimeout(swimmDolphin, 2000);

    // Turtle swims slowly
    const swimTurtle = () => {
      turtleX.setValue(-60);
      Animated.timing(turtleX, { toValue: 420, duration: 9000, useNativeDriver: true }).start(() => {
        setTimeout(swimTurtle, 5000);
      });
    };
    setTimeout(swimTurtle, 1000);
  }, []);

  // Scuba diver + turtle for question phase
  useEffect(() => {
    if (gameState !== 'questions') return;
    const swimDiver = () => {
      diverX.setValue(-80);
      Animated.timing(diverX, { toValue: 420, duration: 7000, useNativeDriver: true }).start(() => {
        setTimeout(swimDiver, 6000);
      });
    };
    const swimTurtle2 = () => {
      turtle2X.setValue(-60);
      Animated.timing(turtle2X, { toValue: 420, duration: 10000, useNativeDriver: true }).start(() => {
        setTimeout(swimTurtle2, 4000);
      });
    };
    swimDiver();
    swimTurtle2();
  }, [gameState]);

  // Timer
  useEffect(() => {
    if (gameState !== 'reading' && gameState !== 'questions') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (gameState === 'reading') {
            setGameState('questions');
            setTimeLeft(QUESTION_TIME);
            setQuestionStartTime(Date.now());
          } else {
            // Time ran out on a question — count as wrong
            if (!answered) {
              handleTimeOut();
            }
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  function handleTimeOut() {
    const q = passage.questions[questionIndex];
    setAnswers(prev => [...prev, {
      question: q.question,
      userAnswer: '(No answer)',
      correctAnswer: q.options[q.correct],
      isCorrect: false, isSpeedy: false, pts: 0,
      explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);
    setLives(l => {
      const n = l - 1;
      if (n <= 0) { setTimeout(() => endGame(), 800); return n; }
      return n;
    });
    shakeScreen();
    setTimeout(() => {
      if (questionIndex + 1 >= passage.questions.length) { endGame(); return; }
      setQuestionIndex(qi => qi + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(QUESTION_TIME);
      setQuestionStartTime(Date.now());
    }, 800);
  }

  function endGame() {
    clearInterval(timerRef.current);
    setGameState('results');
  }

  function handleAnswer(index: number) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);
    const q = passage.questions[questionIndex];
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const isSpeedy = timeTaken < 6;
    const speedBonus = isSpeedy ? Math.max(3, Math.round((6 - timeTaken) * 2)) : 0;
    const isCorrect = index === q.correct;
    playTapSound();
    if (isCorrect) playCorrectSound();
    else playWrongSound();
    let pts = 0;
    if (isCorrect) {
      pts = 8 + speedBonus;
      if (isSpeedy) setSpeedyCount(s => s + 1);
      setScore(s => s + pts);
      showFloatingScore(`+${pts}${isSpeedy ? ` ⚡+${speedBonus}` : ''}`);
    } else {
      setLives(l => { const n = l - 1; if (n <= 0) setTimeout(() => endGame(), 1500); return n; });
      shakeScreen();
    }
    setAnswers(prev => [...prev, {
      question: q.question,
      userAnswer: q.options[index], correctAnswer: q.options[q.correct],
      isCorrect, isSpeedy, pts, explanation: q.explanation,
    }]);
    setQuestionsAnswered(n => n + 1);
    setTimeout(() => {
      if (questionIndex + 1 >= passage.questions.length) { endGame(); return; }
      if (lives <= 1 && !isCorrect) return;
      setQuestionIndex(qi => qi + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(QUESTION_TIME);
      setQuestionStartTime(Date.now());
    }, 1600);
  }

  function shakeScreen() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function showFloatingScore(text: string) {
    setFloatingScore(text);
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: -40, duration: 600, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: -80, duration: 400, useNativeDriver: true }),
    ]).start(() => { setFloatingScore(null); scoreAnim.setValue(0); });
  }

  function togglePause() {
    if (gameState === 'reading' || gameState === 'questions') {
      clearInterval(timerRef.current);
      setPrevGameState(gameState as 'reading' | 'questions');
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState(prevGameState);
    }
  }

  function restartGame() {
    clearInterval(timerRef.current);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setAnswers([]);
    setQuestionsAnswered(0);
    setLives(3);
    setScore(0);
    setTimeLeft(PASSAGE_READ_TIME);
    setSpeedyCount(0);
    setQuestionStartTime(Date.now());
    setGameState('reading');
  }

  const finalScore = questionsAnswered > 0
    ? Math.min(Math.round((score / (questionsAnswered * 12)) * 100), 100) : 0;
  const xpEarned = Math.round(finalScore / 10);
  const timerPct = gameState === 'reading'
    ? timeLeft / PASSAGE_READ_TIME
    : timeLeft / QUESTION_TIME;
  const timerColor = timerPct > 0.5 ? '#10B981' : timerPct > 0.25 ? '#F59E0B' : '#EF4444';

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'results') return;
    playCelebration(finalScore);
    saveGameResult(1, finalScore, xpEarned, 'rw_d1', speedyCount, lives < 0 ? 0 : lives, Date.now());
  }, [gameState]);
  
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const message = finalScore >= 75 ? '🎉 Great!' : finalScore >= 40 ? '👍 Good Job!' : '💪 Nice Try!';
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsTitle}>Answer Review 🤿</Text>
          <View style={styles.passageTitleBadge}>
            <Text style={styles.passageTitleBadgeText}>📖 {passage.title}</Text>
          </View>
          {answers.map((a, i) => (
            <View key={i} style={[styles.reviewCard, { borderLeftColor: a.isCorrect ? '#10B981' : '#EF4444' }]}>
              <Text style={styles.reviewQ}>{i + 1}. {a.question}</Text>
              <Text style={[styles.reviewAnswer, { color: a.isCorrect ? '#10B981' : '#EF4444' }]}>
                Your answer: {a.userAnswer} {a.isCorrect ? '✅' : '❌'}
              </Text>
              {!a.isCorrect && <Text style={styles.reviewCorrect}>✅ Correct: {a.correctAnswer}</Text>}
              <Text style={styles.reviewExplanation}>💡 {a.explanation}</Text>
              {a.isSpeedy && <Text style={styles.reviewSpeedy}>⚡ Speedy bonus!</Text>}
            </View>
          ))}
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>{message}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{correctCount}/{questionsAnswered}</Text>
                <Text style={styles.perfLabel}>Correct</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{speedyCount}</Text>
                <Text style={styles.perfLabel}>⚡ Speedy</Text>
              </View>
              <View style={styles.perfStat}>
                <Text style={styles.perfNum}>{lives < 0 ? 0 : lives}</Text>
                <Text style={styles.perfLabel}>❤️ Lives Left</Text>
              </View>
            </View>
          </View>
          <View style={styles.xpCard}>
            <Text style={styles.xpTitle}>XP Earned</Text>
            <Text style={styles.xpScore}>{finalScore}</Text>
            <Text style={styles.xpSub}>Score out of 100</Text>
            <Text style={styles.xpGained}>+{xpEarned} XP added to Deep Dive</Text>
          </View>
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>📈 Your History</Text>
            <Text style={styles.historySub}>Play more games to see your score history!</Text>
            <Text style={styles.historyRank}>Game #1 — Score: {finalScore}</Text>
          </View>
          {isDailyChallenge ? (
            <>
              {!isLastGame && (
                <TouchableOpacity style={styles.continueBtn} onPress={() => {
                  const nextId = dailyGames[currentIndex + 1];
                  const routes: Record<number,string> = {1:'/wordduel',2:'/flipit',3:'/errorhunt',4:'/polishup',5:'/bridgeit',6:'/speedread',7:'/deepdive',8:'/tonecraft',9:'/shapesnap',10:'/formulaforge',11:'/graphmatch',12:'/datadash',13:'/rapidfire',14:'/storysolve',15:'/mathmemory',16:'/chainreaction'};
                  router.replace({ pathname: routes[nextId] as any, params: { isDailyChallenge: '1', dailyGames: dailyGames.join(','), currentIndex: String(currentIndex + 1) } });
                }}>
                  <Text style={styles.continueBtnText}>Next Challenge ({currentIndex + 2}/4) →</Text>
                </TouchableOpacity>
              )}
              {isLastGame && (
                <TouchableOpacity style={styles.continueBtn} onPress={() => {
                  router.replace({ pathname: '/dailycomplete' as any, params: { dailyGames: dailyGames.join(','), scores: '' } });
                }}>
                  <Text style={styles.continueBtnText}>See Results 🏆</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.quitBtn} onPress={() => router.replace('/(tabs)' as any)}>
                <Text style={styles.quitBtnText}>← Back to Home</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.continueBtn} onPress={restartGame}>
                <Text style={styles.continueBtnText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quitBtn} onPress={() => router.back()}>
                <Text style={styles.quitBtnText}>← Back to Games</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = passage.questions[questionIndex];

  // ─── MAIN GAME ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: shakeAnim }] }]}>

        {/* OCEAN BACKGROUND LAYER */}
        <View style={styles.oceanBg} pointerEvents="none">
          {/* Bubbles */}
          <Animated.Text style={[styles.bubble, { left: '15%', bottom: 0, transform: [{ translateY: bubble1Y }] }]}>🫧</Animated.Text>
          <Animated.Text style={[styles.bubble, { left: '35%', bottom: 0, transform: [{ translateY: bubble2Y }] }]}>🫧</Animated.Text>
          <Animated.Text style={[styles.bubble, { left: '60%', bottom: 0, transform: [{ translateY: bubble3Y }] }]}>🫧</Animated.Text>
          <Animated.Text style={[styles.bubble, { left: '80%', bottom: 0, transform: [{ translateY: bubble4Y }] }]}>🫧</Animated.Text>

          {/* Coral at bottom */}
          <Animated.Text style={[styles.coral, { left: '5%', transform: [{ rotate: coral1Sway.interpolate({ inputRange: [-10, 10], outputRange: ['-6deg', '6deg'] }) }] }]}>🪸</Animated.Text>
          <Animated.Text style={[styles.coral, { left: '22%', transform: [{ rotate: coral2Sway.interpolate({ inputRange: [-10, 10], outputRange: ['-8deg', '8deg'] }) }] }]}>🌿</Animated.Text>
          <Animated.Text style={[styles.coral, { left: '42%', transform: [{ rotate: coral1Sway.interpolate({ inputRange: [-10, 10], outputRange: ['4deg', '-4deg'] }) }] }]}>🪸</Animated.Text>
          <Animated.Text style={[styles.coral, { left: '62%', transform: [{ rotate: coral2Sway.interpolate({ inputRange: [-10, 10], outputRange: ['-5deg', '5deg'] }) }] }]}>🌿</Animated.Text>
          <Animated.Text style={[styles.coral, { left: '78%', transform: [{ rotate: coral1Sway.interpolate({ inputRange: [-10, 10], outputRange: ['7deg', '-7deg'] }) }] }]}>🪸</Animated.Text>
          <Animated.Text style={[styles.coral, { right: '2%', transform: [{ rotate: coral2Sway.interpolate({ inputRange: [-10, 10], outputRange: ['-6deg', '6deg'] }) }] }]}>🌿</Animated.Text>

          {/* Reading phase creatures */}
          {(gameState === 'reading' || (gameState === 'paused' && prevGameState === 'reading')) && (
            <>
              <Animated.Text style={[styles.dolphin, { transform: [{ translateX: dolphinX }] }]}>🐬</Animated.Text>
              <Animated.Text style={[styles.turtle, { transform: [{ translateX: turtleX }] }]}>🐢</Animated.Text>
            </>
          )}

          {/* Question phase creatures */}
          {(gameState === 'questions' || (gameState === 'paused' && prevGameState === 'questions')) && (
            <>
              <Animated.Text style={[styles.diver, { transform: [{ translateX: diverX }] }]}>🤿</Animated.Text>
              <Animated.Text style={[styles.turtle2, { transform: [{ translateX: turtle2X }] }]}>🐢</Animated.Text>
              <Text style={styles.fish1}>🐠</Text>
              <Text style={styles.fish2}>🐡</Text>
            </>
          )}
        </View>

        {/* HEADER */}
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.pauseBtn} onPress={togglePause}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.gameTitle}>🤿 Deep Dive</Text>
            <Text style={styles.gameSubtitle}>D2 · Information & Ideas</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>{score}</Text>
            <Text style={styles.scoreLabel}>pts</Text>
          </View>
        </View>

        {floatingScore && (
          <Animated.Text style={[styles.floatingScore, { transform: [{ translateY: scoreAnim }] }]}>
            {floatingScore}
          </Animated.Text>
        )}

        {/* STATUS ROW */}
        <View style={styles.statusRow}>
          <View style={styles.livesRow}>
            {[1, 2, 3].map(i => (
              <Text key={i} style={styles.heart}>{i <= lives ? '❤️' : '🖤'}</Text>
            ))}
          </View>
          <View style={styles.timerBox}>
            <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
            <View style={styles.timerBarBg}>
              <View style={[styles.timerBarFill, { width: `${timerPct * 100}%` as any, backgroundColor: timerColor }]} />
            </View>
            <Text style={styles.timerLabel}>
              {gameState === 'reading' ? '📖 Read passage' : `❓ Q${questionIndex + 1}/${QUESTIONS_PER_PASSAGE}`}
            </Text>
          </View>
          <View style={styles.qCounterBox}>
            <Text style={styles.qCounter}>{gameState === 'reading' ? '📖' : `${questionIndex + 1}/${QUESTIONS_PER_PASSAGE}`}</Text>
          </View>
        </View>

        {/* READING PHASE */}
        {(gameState === 'reading' || (gameState === 'paused' && prevGameState === 'reading')) && (
          <ScrollView style={styles.passageScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.passageCard}>
              <View style={styles.passageHeaderRow}>
                <Text style={styles.passageTitleText}>{passage.title}</Text>
                <View style={styles.domainBadge}>
                  <Text style={styles.domainText}>{passage.domain} · {passage.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.passageReadLabel}>READ CAREFULLY</Text>
              <Text style={styles.passageBody}>{passage.text}</Text>
              <Text style={styles.passageHint}>⏱ Questions appear when timer ends · Scroll to read all</Text>
            </View>
          </ScrollView>
        )}

        {/* QUESTIONS PHASE */}
        {(gameState === 'questions' || (gameState === 'paused' && prevGameState === 'questions')) && (
          <ScrollView style={styles.questionsScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.qPhaseHeader}>
              <Text style={styles.qPhaseTitle}>📝 Comprehension</Text>
              <Text style={styles.qPhaseSub}>Question {questionIndex + 1} of {QUESTIONS_PER_PASSAGE}</Text>
            </View>
            <View style={styles.questionBox}>
              <Text style={styles.questionText}>{q.question}</Text>
            </View>
            <View style={styles.optionsGrid}>
              {q.options.map((option, index) => {
                let bgColor = '#062535';
                let borderColor = '#0E4060';
                let textColor = '#E2E8F0';
                let letterBg = '#0A3550';
                if (answered) {
                  if (index === q.correct) {
                    bgColor = '#10B98125'; borderColor = '#10B981'; textColor = '#10B981'; letterBg = '#10B981';
                  } else if (index === selectedAnswer) {
                    bgColor = '#EF444425'; borderColor = '#EF4444'; textColor = '#EF4444'; letterBg = '#EF4444';
                  }
                }
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionPill, { backgroundColor: bgColor, borderColor }]}
                    onPress={() => handleAnswer(index)}
                    disabled={answered}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionLetterBox, { backgroundColor: letterBg }]}>
                      <Text style={styles.optionLetter}>{['A', 'B', 'C', 'D'][index]}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

      </Animated.View>

      {/* PAUSE OVERLAY */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>⏸ Paused</Text>
            <Text style={styles.pauseSub}>Score: {score} pts</Text>
            <TouchableOpacity style={styles.pauseOption} onPress={togglePause}>
              <Text style={styles.pauseOptionText}>▶️ Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pauseOption} onPress={restartGame}>
              <Text style={styles.pauseOptionText}>🔄 Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pauseOption, styles.pauseQuit]} onPress={async () => {
              if (isDailyChallenge) {
                const today = new Date().toISOString().split('T')[0];
                const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
                await AsyncStorage.setItem(`daily_played_${today}_${dailyGames[currentIndex]}`, '1');
                router.replace('/(tabs)' as any);
              } else {
                router.back();
              }
            }}>
              <Text style={styles.pauseQuitText}>🚪 Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#062D48' },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#062D48' },

  // Ocean background
  oceanBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden', zIndex: 0,
  },
  bubble: { position: 'absolute', fontSize: 18, opacity: 0.5 },
  coral: { position: 'absolute', bottom: 0, fontSize: 32, transformOrigin: 'bottom' },
  dolphin: { position: 'absolute', top: '25%', fontSize: 36 },
  turtle: { position: 'absolute', top: '40%', fontSize: 28 },
  diver: { position: 'absolute', top: '30%', fontSize: 34 },
  turtle2: { position: 'absolute', top: '50%', fontSize: 26 },
  fish1: { position: 'absolute', top: '20%', right: '15%', fontSize: 24, opacity: 0.7 },
  fish2: { position: 'absolute', top: '60%', right: '30%', fontSize: 20, opacity: 0.6 },

  // Header
  gameHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 14, paddingHorizontal: 20, gap: 12,
    zIndex: 10,
  },
  pauseBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0A3550', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#0891B2',
  },
  pauseIcon: { fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  gameTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  gameSubtitle: { fontSize: 13, color: '#38BDF8', fontWeight: '700' },
  scoreBox: {
    backgroundColor: '#F9731620', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#F97316',
  },
  scoreNum: { fontSize: 22, fontWeight: '900', color: '#F97316' },
  scoreLabel: { fontSize: 10, color: '#F97316', fontWeight: '600' },
  floatingScore: {
    position: 'absolute', right: 24, top: 110,
    fontSize: 24, fontWeight: '900', color: '#10B981', zIndex: 100,
  },

  // Status row
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 10,
    backgroundColor: '#0A3550CC', borderRadius: 16, padding: 12, zIndex: 10,
  },
  livesRow: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 20 },
  timerBox: { alignItems: 'center', flex: 1, marginHorizontal: 10 },
  timerNum: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#0E4060', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  timerLabel: { fontSize: 10, color: '#7DD3FC', fontWeight: '600', marginTop: 3 },
  qCounterBox: {
    backgroundColor: '#0891B220', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: '#0891B2',
  },
  qCounter: { fontSize: 14, color: '#38BDF8', fontWeight: '800' },

  // Passage
  passageScroll: { flex: 1, paddingHorizontal: 20, zIndex: 10 },
  passageCard: {
    backgroundColor: '#041E2EDD', borderRadius: 20,
    padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#0891B240',
  },
  passageHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8,
  },
  passageTitleText: { fontSize: 18, fontWeight: '800', color: '#7DD3FC', flex: 1 },
  domainBadge: {
    backgroundColor: '#0891B220', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: '#0891B2',
  },
  domainText: { fontSize: 11, color: '#38BDF8', fontWeight: '700' },
  passageReadLabel: {
    fontSize: 10, color: '#0891B2', fontWeight: '800',
    letterSpacing: 1.5, marginBottom: 12,
  },
  passageBody: {
    fontSize: 17, color: '#E2E8F0', lineHeight: 30,
  },
  passageHint: {
    fontSize: 12, color: '#38BDF880', marginTop: 16,
    textAlign: 'center', fontStyle: 'italic',
  },

  // Questions
  questionsScroll: { flex: 1, paddingHorizontal: 20, zIndex: 10 },
  qPhaseHeader: {
    backgroundColor: '#0891B215', borderRadius: 16,
    padding: 14, marginBottom: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#0891B230',
  },
  qPhaseTitle: { fontSize: 20, fontWeight: '800', color: '#38BDF8' },
  qPhaseSub: { fontSize: 14, color: '#9CA3AF', marginTop: 2, fontWeight: '600' },
  questionBox: {
    backgroundColor: '#0A3550CC', borderRadius: 16,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#0891B240',
  },
  questionText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', lineHeight: 26 },
  optionsGrid: { gap: 12, paddingBottom: 30 },
  optionPill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 50, padding: 16, borderWidth: 2, gap: 14,
  },
  optionLetterBox: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
  },
  optionLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  optionText: { flex: 1, fontSize: 16, fontWeight: '600', lineHeight: 22 },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', paddingTop: 50, marginBottom: 10 },
  passageTitleBadge: {
    backgroundColor: '#0891B220', borderRadius: 12,
    padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#0891B240',
  },
  passageTitleBadgeText: { fontSize: 15, color: '#38BDF8', fontWeight: '700' },
  reviewCard: {
    backgroundColor: '#0A3550', borderRadius: 16,
    padding: 16, marginBottom: 12, borderLeftWidth: 4,
  },
  reviewQ: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  reviewAnswer: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewCorrect: { fontSize: 14, color: '#10B981', fontWeight: '700', marginBottom: 6 },
  reviewExplanation: { fontSize: 13, color: '#9CA3AF', lineHeight: 20 },
  reviewSpeedy: { fontSize: 13, color: '#F97316', fontWeight: '700', marginTop: 6 },
  performanceCard: {
    backgroundColor: '#0A3550', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#0E4060',
  },
  performanceTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  performanceRow: { flexDirection: 'row', gap: 10, width: '100%' },
  perfStat: {
    flex: 1, backgroundColor: '#062535',
    borderRadius: 16, padding: 14, alignItems: 'center',
  },
  perfNum: { fontSize: 26, fontWeight: '800', color: '#38BDF8' },
  perfLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  xpCard: {
    backgroundColor: '#F9731615', borderRadius: 20,
    padding: 24, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#F97316',
  },
  xpTitle: { fontSize: 16, color: '#F97316', fontWeight: '700' },
  xpScore: { fontSize: 64, fontWeight: '900', color: '#F97316', marginVertical: 8 },
  xpSub: { fontSize: 14, color: '#9CA3AF' },
  xpGained: { fontSize: 17, color: '#10B981', fontWeight: '800', marginTop: 10 },
  historyCard: {
    backgroundColor: '#0A3550', borderRadius: 20,
    padding: 20, marginVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#0E4060',
  },
  historyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  historySub: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  historyRank: { fontSize: 15, color: '#38BDF8', fontWeight: '700' },
  continueBtn: {
    backgroundColor: '#0891B2', borderRadius: 50,
    padding: 18, alignItems: 'center', marginVertical: 20,
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  quitBtn: {
    backgroundColor: 'transparent', borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 30,
    borderWidth: 2, borderColor: '#0E4060',
  },
  quitBtnText: { color: '#9CA3AF', fontSize: 16, fontWeight: '700' },

  // Pause
  pauseOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#00000090', justifyContent: 'center', alignItems: 'center', zIndex: 50,
  },
  pauseCard: {
    backgroundColor: '#0A3550', borderRadius: 24,
    padding: 32, width: '82%', alignItems: 'center',
    borderWidth: 1, borderColor: '#0891B2',
  },
  pauseTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  pauseSub: { fontSize: 15, color: '#9CA3AF', marginBottom: 20 },
  pauseOption: {
    width: '100%', padding: 16, borderRadius: 50,
    backgroundColor: '#0891B2', alignItems: 'center', marginBottom: 12,
  },
  pauseOptionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pauseQuit: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#EF4444' },
  pauseQuitText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});